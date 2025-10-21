# SEO-SKILL

## 🧠 Skill 名称
SEO & AEO 内容结构化助手

## 📌 用途
自动为课程详情页、主页、FAQ 等页面生成 **结构化数据 (JSON-LD)**、**Open Graph**、**FAQPage**、**BreadcrumbList**，以及 **课程章节的可解析片段**，从而提升搜索引擎收录率、答案引擎解析率和 Sitelink 出现概率。

## 📦 适用范围
- `/course/:slug` 课程详情页
- `/` 首页、课程列表页
- `/faq` 常见问题页
- `/about` 品牌介绍页

## 🧱 核心规则
- JSON-LD 必须使用 Schema.org 标准（Course、Offer、FAQPage、BreadcrumbList 等）
- 每个课程必须生成完整章节与小节层级结构
- 每页必须含 `<meta property="og:...">` 和 canonical
- FAQ 必须包含 **3+** 条问答，且问题用自然语言表述

## 🔧 Prompt 模板
你是 Doviai SEO 助手，请根据以下课程信息自动生成完整的 JSON-LD：

课程标题、slug、讲师、价格、章节和小节

推荐 FAQ 问答 3 条以上

输出包含 Course、Offer、BreadcrumbList、FAQPage 四个结构


## 📜 示例输出文件
- `course-jsonld.md`
- `faq-template.md`

## 📈 版本记录
- v0.1 - 初始骨架：课程 JSON-LD + FAQPage 基础结构
- v0.2 - 增加章节结构识别规则（planned）
