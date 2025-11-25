# 课程重构 PRD（新版）

## 1. 项目背景
- 现有课程体系采用「免费/入门/精进/实战/项目落地」五级模型，未对齐最新 LRMI + Schema.org + AEO 要求，亦未覆盖 Program A/B 体系。
- 根据《01 doviai课程设置新版》和《02 doviai课程五维设置说明》：
  - 课程级别统一为 **Beginner / Intermediate / Advanced**（中文：入门/进阶/高阶）。
  - Program A = 会员实战训练体系（Intermediate 课程集合，对应 Curriculum + Unit）。
  - Program B = 职业技能训练体系（Advanced 单买高价值课程，对应 ProfessionalDevelopment）。
- 目标是完成前端数据、组件、结构化数据的全面重构，兼顾旧数据迁移、SEO/AEO 与性能。

## 2. 目标与范围
### 2.1 业务目标
- 课程页、列表页、Program 页全部切换为三级体系，并显式呈现 Program A/B 定位、价格/权益策略。
- 提升搜索结果的课程摘要质量，确保五维 Schema（Level/Type/Access/Outcome/Pathway）完整输出。

### 2.2 范围
- **在范围**：课程级别/标签/筛选、Program A/B 页面信息架构、JSON-LD 输出、课程与 Program 关系（hasCourse/isPartOf）、课程数据迁移与回滚方案、性能回归。
- **不在范围**：后端定价/库存逻辑变更、第三方支付改造、登录注册流程改造。

## 3. 角色与权限
- 未登录用户：可浏览 Beginner/Intermediate/Advanced 课程摘要；不可见会员价。
- 会员：可访问 Program A 全部课程，享受 Program B 课程九折；Access 维度需在页面与 JSON-LD 中反映。
- 管理员/编辑：可通过预留的配置输入 `learningOutcome`、`courseMode` 等字段（前端需保留结构化占位与校验）。

## 4. 涉及修改的文件（前端）
### 4.1 数据与类型
- `src/types/index.ts`：统一 STAGES/level 枚举为 Beginner/Intermediate/Advanced；补充 Schema 相关类型（Level DefinedTerm、learningOutcome 等）。
- `src/utils/stageMap.ts`：提供旧值到新值的映射（含中文与英文别名）；暴露回滚/检查函数。
- `src/store/courseStore.ts`：在初始化时完成 level/stage 映射；提供迁移校验日志（级别分布统计）。

### 4.2 组件
- `src/components/StageTabs.vue`：展示三级标签；会员专区按钮与 Access 状态（会员/公开）并存。
- `src/components/CourseCard.vue`、`src/components/LessonRow.vue`：显示新级别、价格/会员态；注入 learningOutcome 摘要。
- `src/components/CampSection.vue`：筛选逻辑改为三级；支持 Program 过滤。
- `src/components/CurriculumSection.vue`（Program A）、`src/components/ProfessionalDevelopmentSection.vue`（Program B）：呈现 hasCourse 列表、权益/折扣与 Pathway。
- `src/components/CourseIntro.vue`、`CourseCatalog.vue`、`CourseReviews.vue`、`CourseRelated.vue`：分别承担 Type/Outcome、Level/Pathway、Access、Type/Pathway 的 JSON-LD 责任分层。

### 4.3 SEO/AEO（JSON-LD）
- `src/views/CourseDetails.vue`：汇总组件生成的 JSON-LD，包含：
  - **Level**：`educationalLevel` = DefinedTerm（name/id/url 指向 `/levels` 枚举页）。
  - **Type**：`@type` + `about` + `educationalUse`（Lesson/Curriculum/Exercise）。
  - **Access**：`offers`（price/currency/availability）、`audience`（Member/Public）、`courseMode`。
  - **Outcome**：`learningOutcome` 2–4 条（动词 + 能力）。
  - **Pathway**：`isPartOf`（课程 → Program）、Program 页 `hasCourse/hasPart`。
- `src/views` 中 Program 页（若无则新增路由占位）需输出 Program A/B 的 JSON-LD。

## 5. 实现步骤
1) **基线对齐**：在 `src/types/index.ts` 完成 STAGES/level 定义更新，导出五维 Schema 的类型占位。
2) **映射与校验**：在 `stageMap.ts`/`courseStore.ts` 写入旧→新映射与分布统计；记录异常值并降级为 Beginner；输出日志便于灰度验证。
3) **组件升级**：按责任分层更新 StageTabs/CourseCard/CampSection/Program 组件，保证 UI 与逻辑同步；引入 learningOutcome 文案占位。
4) **JSON-LD 聚合**：在 CourseDetails 与 Program 页组合组件的五维数据，落盘 `<script type="application/ld+json">`，新增单元测试/快照（如存在测试框架）。
5) **数据迁移与回滚**：提供迁移脚本/函数，可重复执行；生成迁移前后级别分布对比；设计回滚映射（Beginner -> basic/free，Intermediate -> advanced/project，Advanced -> landing）。
6) **性能与回归**：对课程列表/筛选进行基准对比（列表渲染、筛选响应）；确认未引入阻塞性计算。

## 6. 测试计划
- **单元/集成**：
  - StageTabs/filters 在三个级别下切换正确；会员专区按钮状态正确。
  - CourseCard/LessonRow 展示 level 与会员价正确；CampSection 筛选与 Program 过滤通过。
  - JSON-LD 生成包含五维字段且通过 schema 校验（可使用线上/离线校验器）。
- **数据迁移**：
  - 迁移前后级别分布对比表；异常值计数为 0 或显式日志。
  - 灰度发布：预生产环境先行执行并回归筛选、搜索、详情页。
- **性能**：
  - 列表渲染 TTI/过滤延迟与基线对比，允许 ±5% 波动；如超限需优化。
- **回归**：
  - 会员 Access（九折、权益）显示正确，不影响未登录用户。

## 7. 验收标准
1. 所有课程数据与 UI 均使用 Beginner/Intermediate/Advanced 三级体系，无残留旧标签。
2. Program A/B 页面可见，且 JSON-LD 中建立 hasCourse/isPartOf 关系；会员价/权益展示符合策略。
3. CourseDetails/Program 页的 JSON-LD 覆盖 Level/Type/Access/Outcome/Pathway 五维，并通过校验。
4. 数据迁移脚本可重复执行且提供分布统计与回滚路径；迁移后功能与性能回归通过。
5. 未引入新的 TypeScript/ESLint 错误，现有功能无回归。

## 8. 风险与缓解
- **数据映射异常**：旧值不在映射表。→ 记录日志并降级为 Beginner，同时提示补录。
- **SEO 波动**：重构期间搜索排名波动。→ 在灰度环境运行 schema 校验并比对点击率/收录；必要时启用回滚映射。
- **性能回退**：筛选或列表渲染变慢。→ 设定基准并做懒加载/分页优化；出现超限立即回滚或优化。

## 9. 里程碑与交付物
- **M1：类型与映射（Day 1-2）** —— 提交 STAGES/映射更新，输出迁移脚本草案。
- **M2：组件与 Program（Day 3-5）** —— 完成 StageTabs/CourseCard/CampSection/Program 组件改造。
- **M3：JSON-LD 与测试（Day 6-7）** —— 五维 JSON-LD 聚合、Schema 校验用例、性能对比报告。
