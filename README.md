# LearnHub - 在线学习管理系统 (LMS)

## 项目概述

LearnHub 是一个基于 Next.js 构建的现代化、功能丰富的学习管理系统（LMS），旨在为教师和学生提供直观且强大的教育平台。

## 主要功能

### 课程管理
- 创建、发布和管理课程
- 详细的课程进度追踪
- 交互式作业提交

### 身份认证
- 安全的用户认证
- 基于角色的访问控制
- 集成 NextAuth 提供robust安全性

### 用户体验
- 响应式和现代化的用户界面
- 实时进度追踪
- 直观的导航和课程交互

## 技术栈

- **前端**: Next.js 14
- **后端**: TypeScript
- **身份认证**: NextAuth
- **样式**: Tailwind CSS
- **数据库**: Prisma ORM

## 快速开始

### 前提条件
- Node.js (v18+)
- npm 或 yarn

### 安装步骤
1. 克隆仓库
2. 安装依赖：
```bash
npm install
# 或者
yarn install
```

3. 配置环境变量
4. 运行开发服务器：
```bash
npm run dev
```

## 项目结构
- `src/app/api/`: 后端 API 路由
- `src/components/`: 可复用的 React 组件
- `src/lib/`: 实用函数和助手
- `prisma/`: 数据库架构和迁移

## 项目亮点
- 服务端渲染，优化性能
- 使用 TypeScript 进行类型安全开发
- 模块化和可扩展的架构
- 全面的错误处理
- 响应式设计

## 贡献
欢迎贡献！请在开始之前阅读我们的贡献指南。

## 许可证
本项目为开源项目，遵循 MIT 许可证。
