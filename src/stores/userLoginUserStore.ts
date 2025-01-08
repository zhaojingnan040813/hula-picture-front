import { defineStore } from "pinia";
import { ref } from "vue";
import { getLoginUserUsingGet } from '@/api/userController'
// 有了泛型以后，后续开发就会有字段提示
export const useLoginUserStore = defineStore("loginUser", () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: "未登录",
  });

  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet()//获取登录用户
    if (res.data.code === 0 && res.data.data) {//&&前面表示调用成功，&&后面表示返回的数据不为空
      loginUser.value = res.data.data;
    }

  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser;
  }

  return { loginUser, setLoginUser, fetchLoginUser };
});
