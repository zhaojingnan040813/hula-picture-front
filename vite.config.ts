import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // 配置代理,解决跨域问题，它也可以在后端配置
  server: {
    proxy: {
      '/api': 'http://localhost:8123', //配置请求前缀，以后都不用再用完整路径了
    },
  },

  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
