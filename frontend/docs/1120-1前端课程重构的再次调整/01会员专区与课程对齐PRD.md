# 会员专区与课程重构对齐 PRD（提交给 Claude Code 执行）

## 1. 背景与目标
- 课程体系已切换为三级：Beginner/Intermediate/Advanced，需确保所有前端展示与 AEO/LRMI 要求一致。【F:frontend/AGENTS.md†L45-L76】
- 商业策略更新：
  1. 会员为一年期；单独购买的课程可永久拥有。
  2. Intermediate 课程可单独购买，会员含全部 Intermediate 权益。
  3. Advanced 课程仅可单独购买，会员购买享 9 折但不含在权益内。
  4. 「会员专区」含全部 Intermediate 课程，并新增 10 个会员专享课（不属于 Intermediate/Advanced，可单买但价格更高）。
- 目标：输出能直接驱动前端落地的需求，便于 Claude Code 无需后端即可实现。

## 2. 范围
- 仅前端：组件、路由、JSON-LD、mock 数据，禁止依赖后端接口或改动 API。【F:frontend/docs/1120前端课程重构资料/03 课程体系重构PRD.md†L1-L88】
- 适配会员专区与三级体系的文案、标签、过滤、展示逻辑。

## 3. 用户场景与业务规则
- 新访客：可浏览 Beginner 课程，点击会员专区可看到 Intermediate + 会员专享课，非会员仍可单买会员专享课但高价。
- 会员：一年期内可学习全部 Intermediate 与会员专享课；Advanced 课程享 9 折购买。
- 非会员：Intermediate、Advanced、会员专享课均可单买（会员专享课为高价档）。
- 价格/库存仍用 mock 数据，前端需在 offers/audience 中体现会员与单买区分。【F:frontend/docs/1120前端课程重构资料/02 doviai课程五维设置说明.md†L72-L115】【F:frontend/docs/1120前端课程重构资料/01 doviai课程设置新版.md†L11-L41】

## 4. 功能需求
### 4.1 导航与筛选
- StageTabs：保持三级 tab（Beginner/Intermediate/Advanced）+ 独立「会员专区」入口；点击会员专区时展示 Intermediate + 会员专享课列表。【F:frontend/AGENTS.md†L66-L75】
- CampSection：支持按 stage 和 program 查询参数过滤，增加 audienceType=会员专区 的过滤项，默认阶段 basic。【F:frontend/AGENTS.md†L71-L75】

### 4.2 课程卡与列表
- CourseCard：
  - 使用 stageMap 显示标签，禁止硬编码旧级别；补充会员专享徽标与高价提示。
  - offers 中区分会员价（0 或 9 折）、单买价；audienceType 标记会员专区。【F:frontend/AGENTS.md†L72-L75】【F:frontend/docs/1120前端课程重构资料/02 doviai课程五维设置说明.md†L88-L165】
- LessonRow：若出现旧“免费/付费”文案需改为三级标签或会员专区提示。【F:frontend/AGENTS.md†L71-L73】

### 4.3 Program 页面
- Program A：聚合所有 Intermediate 课程，标记 audienceType=Membership，offers=Membership 包含；提供 JSON-LD hasCourse 列表。
- Program B：聚合 Advanced 课程，offers 为单买价格，audienceType=Public，会员 9 折通过 priceSpecification/eligibleCustomerType 表达。
- 页面需突出会员专区与单买差异，保持已有路由与骨架不变。【F:frontend/docs/1120前端课程重构资料/03 课程体系重构PRD.md†L89-L156】

### 4.4 会员专区新增课程
- 在 mock 数据中新增 10 门会员专享课：
  - stage 字段可设为 `intermediate` 衍生类型或新增 audienceType=会员专区。
  - offers：price 为高价区间，提供 membershipPrice（0 或折扣）；availability=InStock。
  - learningOutcome 至少 2 条，type=Lesson/Exercise（与 Intermediate 一致）。【F:frontend/docs/1120前端课程重构资料/02 doviai课程五维设置说明.md†L131-L165】

### 4.5 JSON-LD/AEO
- Course 页面：补齐 Level/Type/Access/Outcome/Pathway 五维；会员专区课的 audienceType=会员专区，offers 同步高价与会员价；isPartOf 指向 Program A（如适用）。【F:frontend/AGENTS.md†L51-L62】
- Program 页面：hasCourse/hasPart 关联，EducationalOccupationalProgram 类型；Program B 增加 occupationalCredentialAwarded。 【F:frontend/docs/1120前端课程重构资料/03 课程体系重构PRD.md†L157-L220】

## 5. 非功能需求
- 仅使用 Vue3 + TS + Bootstrap，禁用其他 UI 框架。【F:frontend/AGENTS.md†L9-L19】
- 路径统一使用 `@/` alias；不改后端接口；MVP 隐藏企业版 Flag。
- 所有新增文案使用中文，且组件 `<script setup lang="ts">`。

## 6. 验收标准
1. 页面上只出现 Beginner/Intermediate/Advanced/会员专区 标签，无旧文案。【F:frontend/AGENTS.md†L47-L63】
2. 会员专区能同时展示 Intermediate 与 10 门会员专享课，价格与受众信息正确。
3. Program A/B JSON-LD 五维字段齐全，通过 Schema 校验示例。
4. 运行 `npm run type-check`、`npm run build:check` 均通过（如环境允许）。
5. 路由、过滤、课程卡交互无回归，默认阶段 basic。
