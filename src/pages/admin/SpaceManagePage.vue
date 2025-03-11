<template>



  <div id="spaceManagePage">
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
      </a-space>
    </a-flex>

    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">

      <a-form-item label="空间名称">
        <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>


      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="searchParams.spaceLevel"
          style="min-width: 180px"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
        />
      </a-form-item>


      <a-form-item label="用户 id">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户 id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>


    </a-form>



    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">


        <template v-if="column.dataIndex === 'spaceLevel'">
          <div>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</div>
        </template>


        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
          <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
        </template>


        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>


        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>


        <template v-else-if="column.key === 'action'">


          <a-space wrap>
            <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank">
              编辑
            </a-button>
            <a-button danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>



  </div>




</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { formatSize } from '../../utils'
import dayjs from 'dayjs'

//给表格定义展示的列：
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

// 定义全局数据  使用模版插槽就可以拿到script里面定义的值
const dataList=ref([])
const total=ref<Number>(0)

//搜索条件
const searchParams=reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 这是一个计算属性，用于更新搜索条件，把上面的全局变量都包在了这个计算属性里面
// 发生变化的时候会触发重新渲染，但是searchParams不是有了reactive了吗？
const pagination=computed(()=>{
  return {
    current: searchParams.current??1,
    pageSize:searchParams.pageSize??10,
    total: total.value,
  // 我不明白下面还要再定义两个这个有什么用,后续注意一下这两个参数有没有出来,TODO
    showSizeChanger: true,
    // 原来是这样解决total的爆红问题
    showTotal: (total:Number)=>`共${total}条`
  }
})

//获取数据
// 获取数据

const fetchData = async () => {
//   这里面叫函数体，写featch这个函数的具体实现
// 我们这里就把请求参数解构了，请求参数是啥，怎么知道的，看接口文档，看这个方法要哪些东西
  const res = await listSpaceByPageUsingPost({
    ...searchParams
  })

  if (res.data.data){//也就是从后端拿到数据了
    dataList.value=res.data.data.records??[];//返回值是 Space[] 这里没错啊，为什么爆红!!!
    // dataList.value = res.data.data.records ?? []
    total.value=res.data.data.total??0;
  }else{
    // 它们之间是用加号分割开的啊
    message.error('获取数据失败,'+ res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 重置搜索条件
const doSearch=()=>{
  searchParams.current=1
  /**
   * 首先，`searchParams`是使用`reactive`创建的响应式对象。
   * 当它的属性变化时，Vue的响应式系统会检测到这些变化，并更新依赖这些属性的
   * 计算属性或模板中的渲染。然而，仅仅改变`searchParams.current`的值并不
   * 会自动触发网络请求，因为`fetchData`函数并不是一个响应式副作用
   * （比如`watch`或`computed`）。因此，必须显式调用`fetchData`来执行数据获取。
   * computed 的更新不会自动触发网络请求，需要手动调用 fetchData()
   * 来手动获取新数据
   */
  fetchData()
}
// 表格变化处理
const doTableChange=(page:any)=>{//这里的Page就是一个参数名，可以理解成是 int a
  searchParams.current=page.current
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}


// 删除数据
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteSpaceUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}














</script>
