<template>
  <button @click="toggleSortOrder">升序or降序</button>

  <div id="userManagePage">
    <a-table :columns="columns" :data-source="dataList">
<!-- 这个BodeCell模版是用于定义表格中的数据怎么展示 column是列名，record是这一行数据 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" width="30px"/>
        </template>

        <template v-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole=== 'admin' " >
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else-if="record.userRole=== 'user' " >
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>

        <template v-if="column.dataIndex==='createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')  }}
        </template>

        <template v-if="column.dataIndex==='updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss')  }}
        </template>




        <template v-else-if="column.key === 'action'">
          <a-button danger>删除</a-button>


        </template>
      </template>


    </a-table>
  </div>

</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { listUserVoByPageUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const columns = [
  {
    title: 'id',// 这个是展示在前端页面的标题
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
    key: 'action',//因为操作它不是从数据库里面取的值，这个你是可以自己定义的
  },
]




// 模拟数据,它应该是从后端获取的
// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
// ref这个变量如果要取值的话就要加 value 但是 reactive这个变量就不需要加value
// 搜索条件 reactive适合用于对 对象内的数据进行监控，在这里比如current和pageSize发生变化，我们就会进行数据的重新获取，只更新其中一个就会触发响应式更新
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',  // 可以取ascend或者descend
})

// 切换排序顺序
const toggleSortOrder = () => {
  searchParams.sortOrder = searchParams.sortOrder === 'ascend' ? 'descend' : 'ascend'
  fetchData()
}


// 获取数据  双问号代表前面有值就取前面的值，没有值就取后面的值
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams //reactive的响应式变量通常我们都是给它展开然后赋值给body
  })
  if (res.data.data) {//第一个data是ref响应式变量拿内容要用data，第二个data是后端返回的data，有个字段它叫 records
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时请求一次 onMounted是vue3生命周期中的钩子函数，它会在组件挂载后立即调用
onMounted(() => {
  fetchData()
})

</script>

