明白！你现在要的是**开发阶段（dev）前端可落地的 AEO（问答引擎优化）策略**，而不是上线后的运营打法。结合你给的三份文档，我给出一套“立刻能做”的前端实现清单与代码骨架，全部围绕 **Vue3+TS+Vite+Bootstrap 5.3.6** 的现状与约束来设计。 &#x20;

---

# Dev 阶段前端 AEO 策略（面向中国大陆版）

## 0) 原则对齐（来自现有规范）

* 只用 **Vue3 Composition API + TS + Vite + Bootstrap 5.3.6**；新增依赖要有强理由。
* 国内版统一使用**百度统计**与自定义事件埋点；SEO 组件在前端侧实现（动态 meta、FAQ/HowTo、面包屑）。
* API 统一响应 `{status, data, msg}`；前端通过 Axios 拦截器抽取 `data`。

---

## 1) 路由与信息架构（AEO 可抽取的 URL 结构）

**目标**：让“问题=页面”的路由天然可被抓取与抽取。

* 新增 **问答中心与专题分区**

  * `/qa/`（问答中心）
  * `/qa/railway/`、`/qa/vue/`、`/qa/django/`（专题目录页）
  * `/qa/railway-deploy-django/`（**一页一问**详情页，slug=问题的可读短语）
* 在专题页放“**精选答案卡**”+“相关问题”，形成**簇状内链**（易被问答引擎归类）。
* 面包屑：`首页 > QA > Railway > 具体问题`（配合面包屑 Schema）。

> 以上与 PRD 的“SEO组件系统/FAQ 与面包屑”保持一致，实现路径明确。&#x20;

---

## 2) 组件层落地（复用你已有的 SEO 组件位）

在 `src/components/seo/` 下按你约定实现/补全 4 个组件，并形成**使用规约**：

1. `SEOHead.vue`：标题/描述/OG/Canonical/Robots
2. `SchemaData.vue`：渲染 JSON-LD（FAQPage / HowTo / BreadcrumbList / Course）
3. `FAQSection.vue`：一问一答块（可折叠，但**首段默认展开**，便于抽取）
4. `BreadcrumbSEO.vue`：可视化+Schema 同步输出

**页面用法建议（示例）**：

```vue
<!-- QA 详情页：src/views/qa/RailwayDeployDjango.vue -->
<template>
  <main class="container py-4">
    <BreadcrumbSEO :items="breadcrumb" />
    <h1 class="h3 mb-3">如何在 Railway 上部署 Django 5（3 步）？</h1>

    <!-- AEO 关键：首段 60~120 字直接答案，首屏可见 -->
    <p class="lead" data-track="qa.answer-abstract">
      最简 3 步：① 一键创建服务并设置环境变量；② 连接 MySQL/迁移数据；③ 健康检查与回滚策略就绪后再切流。
    </p>

    <!-- 正文分步 + 常见坑 + 相关问题 -->
    <section>
      <h2 class="h5 mt-4">分步</h2>
      <ol>
        <li>...</li>
      </ol>
      <h2 class="h5 mt-4">常见坑</h2>
      <ul><li>...</li></ul>
    </section>

    <FAQSection :items="faqs" class="mt-4" />
    <nav class="mt-4">
      <h3 class="h6">相关问题</h3>
      <ul class="list-unstyled">
        <li><RouterLink to="/qa/vercel-railway-cicd/">Vercel+Railway 的最简 CI/CD？</RouterLink></li>
      </ul>
    </nav>

    <SchemaData :jsonLd="jsonLd" />
    <SEOHead
      title="如何在 Railway 上部署 Django 5（3 步）？ | UAI 学院"
      description="最简 3 步完成 Railway 上的 Django 5 部署：配置环境变量、数据库迁移、健康检查与回滚策略。"
      :canonical="canonicalUrl"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BreadcrumbSEO from '@/components/seo/BreadcrumbSEO.vue'
import FAQSection from '@/components/seo/FAQSection.vue'
import SchemaData from '@/components/seo/SchemaData.vue'
import SEOHead from '@/components/seo/SEOHead.vue'

const breadcrumb = [
  { name: '首页', url: '/' },
  { name: '问答中心', url: '/qa/' },
  { name: 'Railway', url: '/qa/railway/' },
  { name: 'Railway 部署 Django', url: '' }
]

const faqs = [
  { q: '需要哪些环境变量？', a: '至少包含 DB_URL, SECRET_KEY ...' },
  { q: '如何做健康检查？', a: '使用 /healthz 路由，返回 200 表示服务可用...' }
]

// 最小 FAQPage JSON-LD（可按页面生成）
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f:any) => ({
    "@type": "Question","name": f.q,
    "acceptedAnswer": {"@type": "Answer","text": f.a}
  }))
}

const canonicalUrl = computed(() => location.origin + '/qa/railway-deploy-django/')
</script>
```

---

## 3) 数据层与类型（QA 源数据与复用）

* 在 `src/types/seo.ts` 中定义 `QAItem`, `QAGroup` 等类型；`seoStore` 管理当前页的 SEO 状态（你已有雏形，完善即可）。
* MVP 阶段 QA 可本地 JSON 驱动；后续可接后端 `/api/qa/`（遵循统一响应格式），保持「文档即数据」→「API 化」。

---

## 4) 渲染与收录策略（SPA 的 AEO 关键）

**为什么要做**：大陆主流问答/搜索对 SPA 的首屏直出要求更高；纯 CSR 可能降低抽取成功率。
**两档方案（满足“不随意加工具”的约束）**：

* **P1（优先）静态预渲染关键路由**：
  使用 `vite-plugin-ssg` 或 `vite-plugin-prerender` 对 **/qa/** 相关路由生成静态 HTML 快照（不改变技术栈，不引入复杂 SSR）。

  * 仅对 **10\~30 个核心问答页** 预渲染即可（首批专题）。
  * 与现有 Vercel 构建流程兼容（build 后生成 `dist` 的静态文件）。
* **P2（可选）渐进式增强**：
  首屏首段答案、标题、面包屑、JSON-LD **必须在 HTML 中直出**；剩余交互再由 Vue 接管。

> 如需评审是否引入预渲染插件，可在 `CLAUDE.md` 的“新增工具需强理由”下做一次 ADR（Architecture Decision Record）：**理由=提高问答抽取成功率**。

---

## 5) 事件埋点（AEO 相关信号）

配合你现有的埋点规范/工具位，增加 AEO 相关事件：

```ts
// src/composables/useAnalytics.ts （在现有基础上补充）
export const useAnalytics = () => {
  const trackEvent = (name: string, data?: Record<string, any>) => {
    window._hmt?.push(['_trackEvent', name, JSON.stringify(data || {})])
  }

  // AEO 关键事件
  const trackQAShow = (slug: string) => trackEvent('qa.show', { slug })
  const trackFAQClick = (question: string) => trackEvent('faq.click', { question })
  const trackFromSearch = (engine: 'baidu'|'wechat'|'sogou') =>
    trackEvent(`search.from.${engine}`)

  return { trackEvent, trackQAShow, trackFAQClick, trackFromSearch }
}
```

**页面接入要点**

* 进入 `/qa/...` 详情页：`trackQAShow(slug)`
* 点击 FAQ 折叠项：`trackFAQClick(q)`
* 若从外部搜索落地（带 `?from=baidu` 等）：进入时 `trackFromSearch('baidu')`

---

## 6) 页面级 AEO “三要素”DoD（Definition of Done）

勾完这些才算合格的 AEO 页：

1. **首段直答**：标题（就是问题）下第一段 60–120 字给结论，首屏可见（不折叠、不延迟渲染）。
2. **结构化数据**：FAQPage 或 HowTo 的 JSON-LD 已输出（`SchemaData.vue`）。
3. **面包屑**：视觉面包屑 + `BreadcrumbList` JSON-LD。
4. **Canonical / OG / Robots**：`SEOHead.vue` 已设置。
5. **相关问题与内链**：至少 3 条站内相关问答链接。
6. **性能**：首屏 LCP < 2s（QA 页图片极简；不首屏加载视频/重脚本）。
7. **埋点**：`qa.show`、`faq.click`、`search.from.*` 可验证上报。

---

## 7) 站点级产物（Sitemap / Robots / Canonical）

* **Sitemap**：构建时生成 `sitemap.xml`，至少包含 `/qa/**` 路由；每次新增 QA 自动更新。
* **Robots**：允许抓取 `/qa/**`，禁用不必要的查询参数。
* **Canonical**：QA 详情页设置唯一 Canonical，避免同内容多路径。

> 以上与“SEO组件系统”保持一致，由前端在构建阶段产出。&#x20;

---

## 8) 与 API 的最小对接（现在/未来）

* **现在（MVP）**：QA 内容静态化（md/json）→ 前端渲染 → 预渲染静态页。
* **未来**：新增 `/api/qa/`（遵循 `{status,data,msg}`），支持**问答中心/专题/详情**读取；仍保留预渲染以提高抓取效果。

---

## 9) Dev 执行清单（按 PR 合并）

**PR-A（路由+页面骨架）**

* `/qa/`、`/qa/:topic/`、`/qa/:slug/` 三类路由与 1 个示例详情页
* `BreadcrumbSEO` 与 `FAQSection` 初版接入

**PR-B（SEO 组件）**

* `SEOHead`、`SchemaData` 完成；在 QA 详情页填充 FAQPage JSON-LD

**PR-C（埋点）**

* `useAnalytics` 增加 `qa.show / faq.click / search.from.*`；在 QA 页接入

**PR-D（预渲染与构建产物）**

* 引入 `vite-plugin-ssg/prerender`（仅 QA 路由）
* 输出 `sitemap.xml`、完善 `robots.txt`、全站 canonical

**PR-E（性能与验证）**

* 首屏 LCP 优化（QA 页禁用大图/大脚本）
* 百度资源平台提交与抓取校验流程脚本

---

## 10) 你现有文档里直接可复用/对齐的部分

* **SEO组件系统/FAQ/面包屑/Schema** → 直接落在 `src/components/seo/`；按 P1 优先完成。&#x20;
* **Analytics 埋点规范与工具位** → 直接扩展事件名即可。
* **统一 API 响应结构** → 未来把 QA 接到后端也无需改前端抽取逻辑。

---

# 总结（给你可执行的版本）

* **现在做**：建 `/qa/**` 路由与详情页骨架 → 接 `SEOHead/SchemaData/FAQSection/BreadcrumbSEO` → 加 `qa.show/faq.click` 埋点 → 预渲染 10–30 个核心 Q\&A → 产出 sitemap/robots。
* **遵守现有规范**：不破坏 Vue3+TS+Vite+Bootstrap 的约束，新增依赖仅用于 QA 预渲染并给出 ADR 理由。
* **目标**：让**首段直答 + JSON-LD + 可直出 HTML** 在 dev 阶段就具备；上线即被抓取、可抽取。

**In short（中文）**：
在开发阶段就把 **/qa/** 的“问题=页面”做好：首段直接答案、FAQ/HowTo 的 JSON-LD、面包屑 Schema、canonical 和埋点全部接上；对 10–30 个核心问答做**静态预渲染**与 **sitemap** 输出。这样一上线上线，即可被大陆问答/搜索更稳定地抓取与抽取。 &#x20;
