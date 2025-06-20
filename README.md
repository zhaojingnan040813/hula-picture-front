# 🌺 Hula Picture - 图片分享平台

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite)
![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-0170FE?style=flat-square&logo=ant-design)

一个现代化的图片管理与分享平台前端项目

[演示地址](#) | [后端仓库](#) | [API文档](#)

</div>

## 📖 项目简介

Hula Picture 是一个基于 Vue 3 + TypeScript 开发的图片管理与分享平台。用户可以上传、管理、搜索和分享图片，支持空间管理、标签分类、收藏等功能。项目采用现代化的前端技术栈，提供良好的用户体验和开发体验。

## ✨ 功能特性

### 🖼️ 图片管理

- 📤 **图片上传**: 支持单张/批量上传，支持通过URL上传
- 🔍 **智能搜索**: 基于标签和分类的图片搜索
- 📋 **图片详情**: 查看图片详细信息和操作
- ❤️ **收藏功能**: 收藏喜欢的图片
- 🏷️ **标签分类**: 支持多标签和分类管理

### 👥 用户系统

- 🔐 **用户认证**: 注册、登录、权限管理
- 💬 **私信功能**: 用户间私信交流
- 👤 **个人资料**: 用户信息管理
- 🛠️ **管理后台**: 用户、图片、空间的管理功能

### 🏠 空间系统

- 🏗️ **创建空间**: 个人图片空间创建
- 📊 **空间管理**: 空间详情展示和管理
- 🌟 **我的空间**: 个人空间查看和维护

### 🔧 其他功能

- 📝 **日记功能**: 记录和分享生活点滴
- 🎯 **练习模块**: 技能练习和学习
- 📁 **文件管理**: 文件上传下载管理

## 🛠️ 技术栈

### 核心框架

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - JavaScript的超集，提供类型安全
- **Vite** - 下一代前端构建工具

### UI & 样式

- **Ant Design Vue 4** - 企业级UI组件库
- **Vue3 Colorpicker** - 颜色选择组件

### 状态管理 & 路由

- **Pinia** - Vue 3状态管理库
- **Vue Router 4** - Vue.js官方路由管理器

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **OpenAPI** - API文档生成
- **Axios** - HTTP客户端

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

### 生成API客户端

```bash
npm run openapi
```

## 📁 项目结构

```
src/
├── api/                    # API接口定义
│   ├── fileController.ts   # 文件相关API
│   ├── pictureController.ts # 图片相关API
│   ├── userController.ts   # 用户相关API
│   ├── spaceController.ts  # 空间相关API
│   └── messageController.ts # 消息相关API
├── components/             # 通用组件
│   ├── PictureList.vue     # 图片列表组件
│   ├── PictureUpload.vue   # 图片上传组件
│   ├── MessageChat.vue     # 消息聊天组件
│   └── ...
├── layouts/                # 布局组件
│   ├── BasicLayout.vue     # 基础布局
│   └── GlobalHeader.vue    # 全局头部
├── pages/                  # 页面组件
│   ├── HomePage.vue        # 首页
│   ├── admin/              # 管理员页面
│   └── user/               # 用户页面
├── router/                 # 路由配置
├── stores/                 # Pinia状态管理
├── utils/                  # 工具函数
├── constants/              # 常量定义
└── assets/                 # 静态资源
```

## 🎯 核心页面

| 页面     | 路径                 | 功能描述                 |
| -------- | -------------------- | ------------------------ |
| 首页     | `/`                  | 图片展示、搜索、分类筛选 |
| 图片上传 | `/add_picture`       | 单张图片上传             |
| 批量上传 | `/add_picture/batch` | 批量图片上传             |
| 图片详情 | `/picture/:id`       | 查看图片详细信息         |
| 图片搜索 | `/search_picture`    | 高级图片搜索             |
| 我的空间 | `/my_space`          | 个人图片空间             |
| 我的收藏 | `/collection`        | 收藏的图片               |
| 用户登录 | `/user/login`        | 用户登录                 |
| 用户注册 | `/user/register`     | 用户注册                 |
| 私信页面 | `/user/message`      | 用户私信交流             |

## 🔧 开发配置

### IDE推荐

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### TypeScript支持

项目使用 `vue-tsc` 进行类型检查，确保在编辑器中有完整的 `.vue` 文件类型支持。

### Vite配置

详细配置请参考 [Vite Configuration Reference](https://vite.dev/config/)。

## 📝 开发规范

- **代码风格**: 使用 ESLint + Prettier 确保代码一致性
- **提交规范**: 遵循 [Conventional Commits](https://www.conventionalcommits.org/)
- **组件命名**: 使用 PascalCase 命名组件
- **API管理**: 使用 OpenAPI 自动生成 API 客户端

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Ant Design Vue](https://antdv.com/) - 企业级UI组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

[⬆ 回到顶部](#-hula-picture---图片分享平台)

</div>
