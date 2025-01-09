<template>
  <div class="container">
    <button class="sort-button" @click="toggleSortOrder">升序or降序</button>
  </div>

  <div id="userManagePage">
<!--  搜索表单  -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear/>
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>

    <a-table :columns="columns" :data-source="dataList"
             :@change="doTableChange"
             :pagination="pagination"
      >
      <!-- 这个BodeCell模版是用于定义表格中的数据怎么展示 column是列名，record是这一行数据 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" width="30px" />
        </template>

        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else-if="record.userRole === 'user'">
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>

        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

<!-- 后端没有给你返回更新时间，然后这个时间就是dayjs给你显示的当前时间 -->
<!--        <template v-if="column.dataIndex === 'updateTime'">-->
<!--          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}-->
<!--        </template>-->

        <template v-else-if="column.key === 'action'">
          <a-button danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const columns = [
  {
    title: 'id', // 这个是展示在前端页面的标题
    dataIndex: 'id', // 它对应着数据库的字段
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
  },
  {
    title: '操作',
    key: 'action', //因为操作它不是从数据库里面取的值，这个你是可以自己定义的
  },
]

// 模拟数据,它应该是从后端获取的
// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
// ref这个变量如果要取值的话就要加 value 但是 reactive这个变量就不需要加value
// 搜索条件 reactive适合用于对 对象内的数据进行监控，在这里比如current和pageSize发生变化，我们就会进行数据的重新获取，只更新其中一个就会触发响应式更新
// 以后各种搜索条件就都放在这里面，比如搜索条件，排序条件，分页条件等等
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 5,
  sortField: 'createTime',
  sortOrder: 'ascend', // 可以取ascend或者descend
})

// 表格变化处理 这个page参数我不是很理解，它是一个对象，里面有current和pageSize，current是当前页，pageSize是每页显示的条数
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData() // 更改完数据之后重新获取数据
}

// 分页参数 ,关于这里为什么使用computed而不是reactive是因为reactive是对对象内的数据进行监控，
// 而computed是对表达式进行监控，在这里我们不需要对表达式进行监控，只需要对对象内的数据进行监控，所以我们使用computed
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total:(number)) => `共 ${total} 条`, //应该是编辑器的问题导致total下面爆红线，但是不影响运行
  }
})


// 切换排序顺序
const toggleSortOrder = () => {
  searchParams.sortOrder = searchParams.sortOrder === 'ascend' ? 'descend' : 'ascend'
  fetchData()
}

// 获取数据  双问号代表前面有值就取前面的值，没有值就取后面的值
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams, //reactive的响应式变量通常我们都是给它展开然后赋值给body
  })
  if (res.data.code===0&&res.data.data) {
    //第一个data是ref响应式变量拿内容要用data，第二个data是后端返回的data，有个字段它叫 records
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 获取数据
const doSearch = () => {
  // 重置页码  这个很重要，当然，第一次谁知道呀
  searchParams.current = 1
  fetchData()
}

// 删除数据
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}



// 页面加载时请求一次 onMounted是vue3生命周期中的钩子函数，它会在组件挂载后立即调用
onMounted(() => {
  fetchData()
})

</script>

<style>
.container {
  display: flex;
  justify-content: flex-end;
}

.sort-button {
  margin-left: auto;
}
</style>
