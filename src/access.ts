import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { message } from 'ant-design-vue'
import router from '@/router'


let firstFetchLoginUser = true;

router.beforeEach(async (to,from,next)=>{
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;
  if(firstFetchLoginUser){
    await loginUserStore.fetchLoginUser();
    loginUser = loginUserStore.loginUser;
    firstFetchLoginUser = false;

  }
  const toUrl = to.fullPath;
  if(toUrl.startsWith('/admin')){
    if(!loginUser || loginUser.userRole !== 'admin'){
      message.error('没有权限');
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }
  }
  next();
})






















































//
// // 是否为首次获取登录用户
// let firstFetchLoginUser = true;
//
// /**
//  * 全局权限校验 每次路由切换的时候 校验用户是否有权限
//  */
// router.beforeEach(async (to, from, next) => {
//   const loginUserStore = useLoginUserStore()
//   let loginUser = loginUserStore.loginUser
//   // 确保页面刷新，首次加载时，能够等后端返回用户信息后再校验权限
//   if (firstFetchLoginUser) {//之后页面再怎么跳转，都不会再重复校验了
//     await loginUserStore.fetchLoginUser()//获取当前登录用户的信息，
//     loginUser = loginUserStore.loginUser// 再把获取到的用户信息赋值给loginUser
//     firstFetchLoginUser = false;
//   }
//   const toUrl = to.fullPath// ,当前要访问那哪个页面，先拿到全路径，要去的页面
//   if (toUrl.startsWith('/admin')) {
//     if (!loginUser || loginUser.userRole !== 'admin') {
//       message.error('没有权限')
//       next(`/user/login?redirect=${to.fullPath}`)// 视频说它这里并没有实现重定向的跳转
//       return
//     }
//   }
//   next()// 这个next()不穿参数就是放行，跳转到原本要访问的页面
// })
