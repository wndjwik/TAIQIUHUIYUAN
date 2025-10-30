# 台球厅会员管理系统 - Electron 桌面应用

## 项目概述

这是一个基于 Electron 的桌面版台球厅会员管理系统，集成了前端 Vue.js 应用和后端 Node.js 服务。

## 功能特性

- 🖥️ 原生桌面应用体验
- 🔄 自动启动前后端服务
- 📊 完整的会员管理功能
- 💰 充值和消费记录管理
- 📈 数据统计和图表展示
- 🔒 本地数据库存储（SQLite）

## 开发环境运行

### 前置要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

### 开发模式运行

```bash
# 启动开发环境（自动启动前后端和Electron）
npm run electron:dev

# 或者使用简写命令
npm start
```

## 生产环境构建

### 构建桌面应用

```bash
# 构建应用（生成安装包）
npm run electron:dist

# 仅打包应用（不生成安装包）
npm run electron:pack
```

构建完成后，安装包将生成在 `release` 目录中。

### 平台支持

- Windows: `.exe` 安装包
- macOS: `.dmg` 安装包
- Linux: `.AppImage` 应用包

## 项目结构

```
├── src/                 # 前端 Vue.js 源码
├── backend/             # 后端 Node.js 服务
│   ├── src/
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # API 路由
│   │   └── app.js       # 后端主文件
│   └── database.sqlite  # SQLite 数据库文件
├── electron/           # Electron 配置
│   ├── main.js         # Electron 主进程
│   └── assets/         # 应用图标
├── dist/               # 前端构建输出
└── release/            # Electron 构建输出
```

## 技术栈

### 前端
- Vue.js 3.0
- Element Plus UI 组件库
- Vite 构建工具
- ECharts 图表库

### 后端
- Node.js + Express.js
- SQLite 数据库
- Sequelize ORM

### 桌面应用
- Electron 25+
- electron-builder 打包工具

## 配置说明

### 环境变量

创建 `.env` 文件（可选）：

```env
# 开发环境
NODE_ENV=development

# 后端服务端口
PORT=3001

# 前端开发服务器端口
VITE_PORT=3000
```

### 数据库配置

数据库使用 SQLite，配置文件在 `backend/src/config/database.js`。

## 常见问题

### 1. 端口冲突

如果端口 3000 或 3001 被占用，可以修改配置文件：
- 前端端口：修改 `vite.config.js` 中的 `server.port`
- 后端端口：修改 `backend/.env` 中的 `PORT`

### 2. 数据库连接失败

确保 `backend` 目录有写入权限，SQLite 数据库文件将自动创建。

### 3. 构建失败

- 检查 Node.js 版本是否符合要求
- 清理 node_modules 重新安装依赖
- 检查网络连接是否正常

## 开发指南

### 添加新功能

1. 前端功能：在 `src/` 目录中添加 Vue 组件
2. 后端 API：在 `backend/src/routes/` 中添加路由
3. 数据模型：在 `backend/src/models/` 中定义模型

### 调试技巧

- 开发模式下按 F12 打开开发者工具
- 查看控制台日志了解应用运行状态
- 后端日志在终端中显示

## 许可证

MIT License

## 技术支持

如有问题请联系开发团队。