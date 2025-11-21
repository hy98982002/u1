

---

## **🟦 SYSTEM（全局规则）**

你是 Doviai 前端项目的协作工程师，需要根据 PRD 进行**课程体系三级化重构**。
所有操作基于**Vue 3 + Vite + TypeScript + Pinia** 技术栈。
必须严格遵循以下规则：

---

## **🟩【路径规则 — 必须遵守】**

1. 使用路径别名 `@/`，绝对不能替换为相对路径（如 `../utils/xxx`）。
2. 若文件移动，请自动更新对应 alias。
3. 若路径无法解析，先搜索项目结构，而不是直接替换为相对路径。

---

## **🟦【课程三级体系规则】**

### **允许的 StageKey：**

```
basic         // 入门 Beginner
intermediate  // 进阶 Intermediate
advanced      // 高阶 Advanced
```

### **必须将所有旧字段映射为新体系：**

旧字段包括：

```
free, basic, advanced, project, landing,
入门, 精进, 实战, 项目落地, 高级
```

映射表（前端阶段）：

```
free/basic/入门         → basic
advanced/精进/project   → intermediate
landing/项目落地/高级    → advanced
```

### ❗ 不得在组件中硬编码“入门/进阶/高阶”，必须使用 stageMap。

---

## **🟨【文件修改范围】**

你可以修改以下内容：

### ✔ **可修改：**

* `src/types/index.ts`（STAGES/StageKey/Level）
* `src/utils/stageMap.ts`
* `src/utils/slug.ts`
* `src/store/courseStore.ts`
* `src/components/*`（Tabs/Card/Row/Grid/Section）
* `src/views/program/*`（可创建）
* `src/utils/jsonld/*`（可创建）
* `src/router/index.ts`（只允许新增 program 路由）

### ❌ **禁止修改：**

* 后端 API（不存在时不要创建 mock API）
* alias 配置（vite.config.ts）
* 真实支付/会员/后端逻辑

---

## **🟩【JSON-LD 规则】**

### ✔ 只在**教育部分**使用 LRMI：

```
educationalUse
educationalLevel
learningResourceType
learningOutcome
```

### ❌ 非教育字段不得使用 LRMI（必须用普通 Schema）：

* price / offers
* breadcrumbs
* FAQ
* organization
* rating
* image
* availability

### ✔ 课程 JSON-LD 必须包含五维：

```
Level
Type
Access
Outcome
Pathway
```

### ✔ Program JSON-LD 中必须包含：

```
hasCourse
isPartOf
```

---

## **🟦【组件重构要求】**

### ✔ StageTabs.vue

* 只显示 3 个级别
* 会员专区按钮单独处理，不属于 stage

### ✔ CourseCard.vue

* stage 显示必须用 `stageMap`
* slug 使用新规则
* JSON-LD 数据出处规范

### ✔ CampSection.vue

* 筛选逻辑切换为 3 阶段
* 支持 Program 过滤（若 URL query 存在 program）

### ✔ LessonRow.vue

* 替换 stage/level 旧值
* 保留 A11y 行为（不能删）

---

## **🟩【Program 页面构建】**

你可以创建：

```
src/views/program/ProgramAView.vue
src/views/program/ProgramBView.vue
```

要求：

* 使用 mock 课程数据
* 结构：介绍 → hasCourse 列表 → 权益 → JSON-LD
* URL 示例：

  * `/program/aigc-intermediate`
  * `/program/ai-designer-advanced`

---

## **🟧【Store（courseStore.ts）重构规则】**

1. **必须创建 migrateStages() / migrateLevels()**
2. 在 store 初始化时自动执行映射
3. 输出迁移统计（console.table）
4. 不得依赖 API
5. 不得做真实 DB 迁移（只是前端假数据转换）

---

## **🟦【slug 生成规则】**

示例：

```
AI Photoshop 设计课（入门） → ai-photoshop-design-beginner
```

规则：

* 级别段必须使用：`beginner / intermediate / advanced`
* 删除旧标签（精进、实战、项目落地等）
* 自动转 slug（小写 + 连字符）

---

## **🟩【Claude Code 编辑策略】**

必须遵循：

### ✔ 允许：

* 批量修改组件
* 自动更新类型
* 自动修复引用
* 新建 JSON-LD 工具
* 新建 Program 页面

### ❌ 禁止：

* 重写 alias 为相对路径
* 删除现有业务逻辑
* 推测创建 API
* 推测会员系统、支付逻辑
* 重构与课程无关的模块

---

## **🟥【统一重构提示（每次执行前自动带上）】**

```
请根据课程三级体系（basic/intermediate/advanced），
批量重构所有组件、类型、store、slug、stageMap、Program 页，
并生成完整 JSON-LD 支持（五维：Level/Type/Access/Outcome/Pathway）。

注意：
- 不改 alias。
- 不创建后端 API。
- 不使用非必要推测逻辑。
```

---



