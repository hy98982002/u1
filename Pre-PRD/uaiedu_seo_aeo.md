# 《uaiedu.com 全球中文版 SEO + AEO 改进说明》

## 1. 背景

-   当前主站：**uaiedu.com**
    -   面向
        **全球中文用户**，仅提供中文内容（简体为主，部分繁体兼容）。
    -   **未设置 i18n**，但
        **不关闭海外访问端口**，因此海外中文用户仍能直接访问。
-   未来规划：**uaiedu.org**
    -   面向 **海外用户（华人 + 国际用户）**
    -   将支持 **i18n 多语言**（中文简体/繁体/英文），提升 SEO + AEO
        在全球范围内的表现。

## 2. 现状问题

1.  **uaiedu.com 全球访问**
    -   对大陆搜索引擎（百度、360、搜狗）适配较自然。
    -   海外用户访问无障碍，但 Google/Bing 对仅中文页面的识别存在局限。
    -   AI 搜索 (ChatGPT/Perplexity)
        在多语言问题中，可能因为**缺少英文/多语言标记**而引用率较低。
2.  **uaiedu.org 未来 i18n**
    -   需要在 SEO 层面提前准备 **多语言结构**，如
        hreflang、站点地图分区。
    -   AEO 需要多语言 **Q&A/FAQ**，提升被 AI 引用的概率。

## 3. SEO 改进方案

### 3.1 uaiedu.com（现阶段，全球中文版）

-   **搜索引擎覆盖**：
    -   大陆 → 重点优化百度（ICP 备案、站长工具提交、内容中文长尾词）。
    -   海外 → Google/Bing 用中文索引，补充繁体关键词。
-   **优化措施**：
    1.  所有课程、文章页面添加 **结构化数据 (JSON-LD)** →
        `Course`、`FAQ`、`Organization`。
    2.  增加 **繁体中文别名**（title/description 中补充）。
    3.  建立 **双份站点地图**：
        -   sitemap-cn.xml（面向中文搜索引擎）
        -   sitemap-global.xml（面向 Google/Bing）

### 3.2 uaiedu.org（未来 i18n 版）

-   **搜索引擎覆盖**：
    -   Google → 主力优化，多语言索引。
    -   Bing → 辅助优化，和 Google 基本一致。
-   **优化措施**：
    1.  页面使用 **hreflang** 标记（zh-CN / zh-TW / en）。
    2.  提供 **多语言内容**（课程介绍、FAQ、文章）。
    3.  独立 sitemap → sitemap-zh.xml / sitemap-en.xml /
        sitemap-tw.xml。
    4.  国际 CDN 部署，提升海外访问速度。

## 4. AEO 改进方案

### 4.1 uaiedu.com（全球中文版）

-   增加 **问答化 FAQ** → 每个课程页面下方放置 Q&A。
-   在 FAQ 中使用自然语句（如 "如何报名UAI Python课程？"）。
-   确保 **课程/师资/学习路径** 用 schema.org FAQPage 标记。
-   在外部中文平台（知乎、简书、微信公众号）发布文章，引用回
    uaiedu.com，提升 AI 回答抓取率。

### 4.2 uaiedu.org（未来 i18n）

-   每个页面提供 **双语 Q&A**（中文 + 英文）。
-   发布多语言 **权威文章**（LinkedIn、Medium），指向 uaiedu.org，增加
    AI 抓取概率。
-   在英文 FAQ 中使用 "Chinese AI Education" 关键词，方便 AI
    将站点与全球教育类搜索匹配。

## 5. 成功指标

-   **uaiedu.com（短期目标）**：
    -   百度/Google/Bing 收录率 ≥ 90%
    -   核心课程关键词百度进入前 10
    -   Perplexity/ChatGPT 中文问答出现 uaiedu.com 引用 ≥ 10%
-   **uaiedu.org（长期目标）**：
    -   多语言索引收录率 ≥ 95%
    -   目标关键词 (AI education, Chinese AI learning) Google 前 20
    -   AI 搜索中英文 Q&A 引用率 ≥ 20%

## 6. 版本路线

-   **V1.0**（现阶段）：uaiedu.com 做 **全球中文 SEO +
    AEO**（不关海外端口，优化百度 + Google + AI FAQ）。
-   **V1.1**（过渡）：在 uaiedu.com 中准备 **i18n
    架构预留**（目录结构、hreflang），不展示英文版，但框架先搭好。
-   **V2.0**（未来）：启用 uaiedu.org，发布 **多语言 i18n 版**，SEO+AEO
    全局优化。
