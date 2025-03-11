<template>
  <div class="spaceManagePage">
    <!--这个flex 和原生CSS中的flex布局好像呐-->
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" href="#" target="_blank">+创建空间</a-button>
      </a-space>
    </a-flex>

    <!-- layout="inline"是为了让表格的每一项在一行上，这有点像 display:flex   -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="空间名称">
        <!-- 后期再补v-model先不让它爆红       -->
        <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allow-clear />

      </a-form-item>

      <a-form-item label="空间级别" name="spaceLevel">
<!--  我靠，原来这里是options而不是option,怪不得我渲染不出来，这编译器也不报错，奶奶的      -->
        <a-select
          v-model:value="searchParams.spaceLevel"
          style="min-width: 180px"
          :option="SPACE_LEVEL_OPTIONS"
          allow-clear
          placeholder="请选择空间级别"

        />
      </a-form-item>



      <a-form-item label="用户ID">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户 id" allow-clear />

      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>


    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >

    </a-table>


  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { listSpaceByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { SPACE_LEVEL_OPTIONS } from '@/constants/space'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]
// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

//定义一个全局的响应式数据，它里面的Data数据发生变化的时候，Vue组件就会重新渲染
// 这里的响应式数据通常是指其内部值的变化，而不是变量本身的重新赋值。例如，
// 使用Vue的ref，虽然变量是用const声明的，但通过.value属性可以修改其内部值，而变量本身的引用并没有改变。
//在响应式编程中推荐使用const。主要原因是避免意外地重新赋值给变量，导致响应式系统失去跟踪
//还需要提到，虽然技术上可以使用let或var，但const是更好的实践，因为它有助于代码的可维护性和减少错误。
// const dataList = ref<API.Space[]>()
const dataList = ref<API.Space[]>([])// 相比于上面注释掉的，提供了空数组作为初始值
const total=ref(0)

const fetchData = async () => {
  // 这里面是函数体
  const res = await listSpaceByPageUsingPost({
    ...searchParams, // 这里是解构赋值
  })
  // code为0表示请求成功，data包含实际数据。
  if (res.data.code === 0 && res.data.data) {
    //需要定义一个全局的dataList存储请求响应得到的数据
    // dataList.value = res.data.data.records 两个问号叫空值合并运算符,这样即使后端返回的数据有问题，前端也能安全地处理，避免运行时错误。
    dataList.value = res.data.data.records??[]//也许在JS里面这样写是可以的，我没试，反正这里是TS
    total.value=res.data.data.total??0;
  }else{
    message.error('获取数据失败，'+res.data.message)
  }
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})
// computed() 创建响应式计算属性，我感觉到了我的基础的薄弱
const pagination=computed(()=>{
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    // showTotal: (total)=>`共${total}条`
    showTotal: (total) => `共 ${total} 条`,

  }
})

// 表格变化之后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}


//搜索数据
const doSearch = () => {
  //重置页码
  searchParams.current = 1
  fetchData()
}
</script>

<style scoped></style>
