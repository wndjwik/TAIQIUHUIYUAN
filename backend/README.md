# 台球厅会员管理系统 - 后端API

## 项目概述

这是一个基于 Node.js + Express + SQLite 的台球厅会员管理系统后端API服务。

## 技术栈

- **后端框架**: Node.js + Express.js
- **数据库**: SQLite (嵌入式数据库，无需单独安装)
- **ORM**: Sequelize
- **API规范**: RESTful API

## 项目结构

```
backend/
├── src/
│   ├── app.js                 # 应用入口文件
│   ├── config/               # 配置文件
│   │   ├── database.js       # 数据库配置
│   │   └── sequelize.js      # Sequelize 初始化
│   ├── models/               # 数据模型
│   │   ├── Member.js         # 会员模型
│   │   ├── RechargeRecord.js # 充值记录模型
│   │   └── ConsumeRecord.js  # 消费记录模型
│   ├── controllers/          # 业务逻辑控制器
│   │   ├── memberController.js
│   │   ├── rechargeController.js
│   │   └── consumeController.js
│   └── routes/               # API路由
│       ├── members.js
│       ├── recharge.js
│       └── consume.js
├── database.sqlite          # SQLite 数据库文件（自动生成）
├── package.json
└── .env                     # 环境变量配置
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 启动生产服务器

```bash
npm start
```

## API 接口文档

### 健康检查
- **GET** `/api/health`
- 返回服务器状态信息

### 会员管理

#### 获取所有会员列表
- **GET** `/api/members`
- 参数：无
- 返回：会员列表

#### 获取单个会员详情
- **GET** `/api/members/:member_id`
- 参数：会员编号
- 返回：会员详细信息

#### 创建新会员
- **POST** `/api/members`
- 请求体：
```json
{
  "member_id": "800001",
  "name": "张三",
  "phone": "13800138001"
}
```

#### 更新会员信息
- **PUT** `/api/members/:member_id`
- 请求体：
```json
{
  "name": "张三",
  "phone": "13800138001"
}
```

#### 删除会员
- **DELETE** `/api/members/:member_id`
- 参数：会员编号

### 充值管理

#### 执行充值操作
- **POST** `/api/recharge`
- 请求体：
```json
{
  "member_id": "800001",
  "amount": 200,
  "operator": "管理员"
}
```

#### 获取充值记录列表
- **GET** `/api/recharge/records`
- 查询参数：
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认20）
  - `member_id`: 会员编号（可选）

### 消费管理

#### 执行消费操作
- **POST** `/api/consume`
- 请求体：
```json
{
  "member_id": "800001",
  "amount": 100,
  "operator": "管理员"
}
```

#### 获取消费记录列表
- **GET** `/api/consume/records`
- 查询参数：
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认20）
  - `member_id`: 会员编号（可选）

## 数据库设计

### 会员表 (members)
- `member_id` (主键): 会员编号
- `name`: 会员姓名
- `phone`: 联系电话
- `balance`: 余额
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 充值记录表 (recharge_records)
- `id` (主键): 记录ID
- `member_id`: 会员编号
- `member_name`: 会员姓名
- `amount`: 充值金额
- `operator`: 操作员
- `createdAt`: 充值时间

### 消费记录表 (consume_records)
- `id` (主键): 记录ID
- `member_id`: 会员编号
- `member_name`: 会员姓名
- `amount`: 消费金额
- `operator`: 操作员
- `createdAt`: 消费时间

## 开发说明

### 数据库操作
- 使用 Sequelize ORM 进行数据库操作
- 支持事务处理（充值、消费操作）
- 自动创建数据库表结构

### 错误处理
- 统一的错误响应格式
- 详细的错误信息
- HTTP 状态码规范

### 数据验证
- 请求参数验证
- 业务逻辑验证（如余额检查）
- 数据库约束验证

## 部署说明

### 开发环境
- 端口：3001
- 数据库：SQLite（自动生成 database.sqlite 文件）

### 生产环境
- 修改 `.env` 文件中的配置
- 使用 `npm start` 启动服务
- 建议使用 PM2 进行进程管理

## 注意事项

1. **数据库文件**: SQLite 数据库文件 `database.sqlite` 会在首次启动时自动创建
2. **示例数据**: 首次启动时会自动插入示例会员数据
3. **端口冲突**: 如果端口3001被占用，请修改 `.env` 文件中的 PORT 配置
4. **数据备份**: 定期备份 `database.sqlite` 文件

## 故障排除

### 常见问题

1. **端口被占用**
   - 修改 `.env` 文件中的 PORT 配置
   - 或使用其他可用端口

2. **数据库连接失败**
   - 检查数据库文件路径权限
   - 确保有足够的磁盘空间

3. **依赖安装失败**
   - 清除 node_modules 重新安装
   - 检查网络连接

## 许可证

MIT License