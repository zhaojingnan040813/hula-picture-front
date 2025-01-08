<template>
<!-- 原本外面没有这个 div ，这里加上了是为了整体控制样式  -->

   <a-row>
     <a-col flex="200px">
       <RouterLink to="/">
         <div class="title-bar">
           <img class="logo" src="../assets/favicon.ico" alt="logo" width="50" height="50" />
           <div class="title">呼啦云图库</div>
         </div>
       </RouterLink>
     </a-col>

     <a-col flex="auto">
       <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="doMenuClick" />
     </a-col>

     <a-col flex="120px">
       <div class="user-login-status">
         <div class="user-login-status">
           <div v-if="loginUserStore.loginUser.id">
             {{ loginUserStore.loginUser.userName ?? '无名' }}
           </div>
           <div v-else>
             <a-button type="primary" href="/user/login">登录</a-button>
           </div>
         </div>
       </div>
     </a-col>
   </a-row>





</template>
<script lang="ts" setup>
import { h, ref } from 'vue';
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import router from '@/router'
import { useRoute } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
// 这里报错了，我加了一个type就好了

// 有了这个，菜单栏里面点了以后就会出现路由跳转，地址导航栏会跟着变化，一般以后你有导航栏都要有这个
const doMenuClick = (e: { key: string }) => {
  router.push({
    path: e.key
  })
};
const route = useRoute()
const current = ref<string[]>([route.path]);
router.afterEach((to,from,next) => {
  current.value = [to.path]//把当前的高亮路由地址赋值给current, current 就是用于高亮的
})

const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(MailOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    icon: () => h(AppstoreOutlined),
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    icon: () => h(SettingOutlined),
    label: '其他',
    title: '其他',
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          {
            label: 'Option 1',
            key: 'setting:1',
          },
          {
            label: 'Option 2',
            key: 'setting:2',
          },
        ],
      },
      {
        type: 'group',
        label: 'Item 2',
        children: [
          {
            label: 'Option 3',
            key: 'setting:3',
          },
          {
            label: 'Option 4',
            key: 'setting:4',
          },
        ],
      },
    ],
  },
  {
    key: 'other',
    label: h('a', { href: 'https://github.com/zhaojingnan040813', target: '_blank' }, '我的主页'),
    title: '作者的Github主页',
  },
]);

const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()



</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>


