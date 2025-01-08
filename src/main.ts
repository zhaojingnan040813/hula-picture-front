import App from './App.vue'
import router from './router'
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { createApp } from 'vue'
import { createPinia } from 'pinia'



const app = createApp(App)
app.use(Antd);
app.use(createPinia())//也可以const一个pinia实例，然后app.use(pinia)
app.use(router)

app.mount('#app')
