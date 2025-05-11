<template>
  <div id="globalSider">
    <a-layout-sider class="sider" v-if="loginUserStore.loginUser.id" breakpoint="lg" width="200">
      <a-menu
        mode="inline"
        v-model:selectedKeys="current"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
// 菜单列表
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
//
import {
  PictureOutlined,
  UserOutlined,
  StarOutlined,
  HeartOutlined,
  StarTwoTone,
  TeamOutlined,
  FolderOpenOutlined,
  MessageOutlined,
} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/userLoginUserStore'

const loginUserStore = useLoginUserStore()

const menuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/collection',
    label: '我的收藏',
    icon: () => h(StarOutlined),
  },
  //  刷题的列表
  {
    key: '/practice',
    label: '刷题',
    icon: () => h(HeartOutlined),
  },
  //   我的日记
  {
    key: '/diary',
    label: '我的日记',
    icon: () => h(FolderOpenOutlined),
  },
  // 找到我的各种方式
  {
    key: '/find_me',
    label: '找到我',
    icon: () => h(TeamOutlined),
  },
  {
    key: '/user/message',
    icon: () => h(MessageOutlined),
    label: '私信',
    requiredAuth: true,
  },
]

const router = useRouter()

// 当前选中菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, failure) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
</script>

<script lang="ts">
export default {}
</script>

<style scoped>
#basicLayout .header {
  margin-bottom: 1px;
}

#basicLayout .content {
  padding: 28px;
}

#basicLayout .sider {
  background: #fff;
  padding-top: 20px;
  border-right: 0.5px solid #eee;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}
</style>
