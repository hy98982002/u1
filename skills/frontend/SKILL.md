# FRONTEND-SKILL

## 🧠 Skill 名称
Vue 3 + Bootstrap 5.3.6 前端组件开发助手

## 📌 用途
为前端开发提供统一的组件结构、命名风格、响应式规范和可维护性约束。确保 Claude 生成的代码符合 Doviai 项目标准。

## 📦 适用范围
- 所有 `.vue` 组件（课程卡片、课程详情、导航栏、FAQ、购物车等）
- 前端目录结构规范
- 响应式布局与 SEO 友好结构

## 🧱 核心规则
- 使用 Vue 3 + Composition API
- 使用 Bootstrap 5.3.6 栅格系统，BEM 命名
- 必须为所有 props 提供类型和默认值
- 所有交互事件以 `handleXxx` 开头命名
- 所有图片需带有 `alt` 属性并使用 `srcset` 响应式加载
- 每个组件必须配套注释、emit 事件声明和测试用例

## 🔧 Prompt 模板
你是 Doviai 前端开发助手，请按照以下规范创建 Vue 组件：

使用 Composition API

使用 Bootstrap 栅格和 BEM 命名

包含响应式布局

提供完整 props 类型声明与事件函数


## 📜 示例输出文件
- `vue-guidelines.md`
- `component-template.md`

## 📈 版本记录
- v0.1 - 初始骨架：组件结构和命名规范
- v0.2 - 增加 `emit` 命名规则和单元测试建议（planned）
