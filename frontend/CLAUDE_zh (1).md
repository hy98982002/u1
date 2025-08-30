# CLAUDE.md（前端开发指南 - 中文版）

本文件为 Claude Code 在处理 UAI 教育平台 `/frontend` 目录时提供前端开发指导。

## 项目概述

UAI 教育平台前端 —— 基于 Vue 3 + TypeScript + Vite 的在线教育服务应用。  
开发聚焦响应式设计、组件化架构和现代 JavaScript 实践，仅限前端上下文。

## 前端技术栈

**核心框架：**
- Vue 3（Composition API）+ TypeScript
- Vite 构建工具与开发服务器
- Bootstrap 5.3.6 作为 UI 框架（禁止使用其他 UI 框架）
- Pinia 状态管理
- Vue Router 路由
- Axios 用于 API 请求

**开发工具：**
- TypeScript：类型安全
- ESLint + Prettier：代码质量
- Vite：快速开发与优化构建

## 开发命令

所有命令均在 `/frontend` 目录下执行：

```bash
npm install              # 安装依赖
npm run dev              # 启动开发服务器 (localhost:5173)
npm run build            # 生产构建
npm run build:check      # 带TS检查的构建
npm run type-check       # 仅执行TS类型检查
npm run preview          # 预览生产构建

# 特定功能依赖
npm install opencc-js    # 繁简转换库
npm install vue-gtag     # 分析工具集成
npm install @types/gtag  # 分析工具的TS类型定义
```

## 前端架构

### 目录结构

```
src/
├── views/                         # 页面级组件
│   ├── HomeView.vue               # 首页
│   ├── CourseDetails.vue          # 课程详情页
│   ├── ShoppingCart.vue           # 购物车页
│   ├── Order.vue                  # 订单页
│   └── PersonalCenter.vue         # 用户中心
├── components/                    # 可复用组件
│   ├── cart/                      # 购物车相关组件
│   ├── order/                     # 订单相关组件
│   ├── personCenter/              # 用户中心组件
│   ├── seo/                       # SEO相关组件
│   │   ├── SEOHead.vue           # 动态meta标签组件
│   │   └── FAQSection.vue        # FAQ组件
│   ├── Navbar.vue                 # 导航栏
│   ├── CourseCard.vue             # 课程卡片
│   ├── LoginModal.vue             # 登录模态框
│   └── ...                        # 其他组件
├── store/                         # Pinia 状态管理
│   ├── index.ts                   # Store 配置
│   ├── authStore.ts               # 登录状态
│   ├── courseStore.ts             # 课程数据
│   ├── uiStore.ts                 # UI状态
│   └── seoStore.ts                # SEO状态
├── api/                           # Axios 封装
│   ├── auth.ts                    # 登录API
│   ├── courses.ts                 # 课程API
│   └── orders.ts                  # 订单API
├── router/                        # 路由配置
│   └── index.ts
├── types/                         # TS 类型定义
│   ├── index.ts
│   ├── cart.ts
│   ├── order.ts
│   └── seo.ts
├── utils/                         # 工具函数
│   ├── toast.ts                   # 提示
│   ├── seo.ts                     # SEO工具
│   └── tracking.ts                # 埋点工具
├── composables/                   # Vue3 Composables
│   └── useAnalytics.ts            # 分析Composable
├── assets/                        # 静态资源
│   ├── icons/
│   ├── images/
│   ├── fonts-clarity.css
│   └── vue.svg
└── config/
    └── baidu.json                 # 百度统计配置
```

---

## 开发约定

- 严格使用 Vue 3 Composition API，不允许 Options API  
- 所有 `.vue` 文件必须 `<script setup lang="ts">`  
- PascalCase 命名组件  
- props/emits 使用 TS 接口定义  
- 优先使用 Bootstrap Utility Classes  
- 所有图片必须 import 引入，不可使用字符串路径  

---

## UI/UX 指南

- 响应式设计：移动优先，断点定义 xs/sm/md/lg/xl/xxl  
- 字体优化：`-webkit-font-smoothing`，分层处理保证清晰度  
- 玻璃拟态：仅背景层，文字层保持清晰  

---

## 性能优化

- 路由懒加载  
- 图片优化（WebP，懒加载，srcset）  
- Vite 构建分包（vendor/utils）  

---

## 安全规范

- 环境变量使用 `.env`，不得硬编码  
- XSS防护：用 `v-text` 替代 `v-html`  
- CSRF由Axios处理  
- JWT 存储在 localStorage 并设置过期  

---

## 部署

- Vercel 部署：Vite Preset，`npm run build`，输出 `dist/`  
- 环境变量：VITE_API_BASE_URL / VITE_BAIDU_SITE_ID / VITE_ANALYTICS_TIMEOUT  

---

## 开发哲学

- 增量开发优于大重构  
- 代码要清晰而非聪明  
- 遵循现有模式，避免过度抽象  
- 三次失败后必须停下，记录、反思、寻找替代方案  

---

## 质量门槛

- TS编译无错误  
- 所有组件响应式良好  
- Props/Emits 有类型定义  
- 遵循 PascalCase  
- Bootstrap 优先，避免自定义 CSS  
- 测试覆盖率达标  

---

## 总结

这是一个前端专用的 CLAUDE.md，完整定义了：  
- 技术栈（Vue3+TS+Pinia+Bootstrap+Vite）  
- 目录结构与命名规范  
- 开发与部署流程  
- UI/UX 与性能优化标准  
- 安全与质量门槛  

旨在为 **UAI 教育平台** 提供一致、可维护、可扩展的前端开发规范。
