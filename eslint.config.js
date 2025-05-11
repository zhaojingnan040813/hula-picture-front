// eslint.config.js - 完全禁用所有规则
export default [
  {
    // 只保留必要的基本配置
    files: ['**/*.{js,ts,vue}'],
    // 忽略所有文件 - 这是禁用 ESLint 的最彻底方法
    ignores: ['**/*'],
    rules: {}
  }
]
