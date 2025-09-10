
# UAI 平台 SEO / AEO 与 Udemy 案例总结

> 时间范围：2025年9月6日-2025年9月7日  
> 整理范围：AEO/SEO、图片比例、Udemy结构分析、Google检测结果

---

## 1. AEO / SEO 基础概念与标准

### 1.1 AEO与SEO区别
| 维度 | 传统SEO | AEO (Answer Engine Optimization) |
|------|----------|----------------------------------|
| 目标 | 提升搜索排名 | 让AI搜索直接理解并输出内容 |
| 内容要求 | 关键词、链接 | **结构化数据 + 多模态识别** |
| 图片标准 | ≥1280px 推荐 | **必须≥1280×720 严格16:9** |
| 输出形式 | 列表 | AI答案卡片、搜索富摘要 |

**核心结论**  
- AEO更关注**数据结构化**和**内容实体化**，例如课程、讲师、视频等。  
- 传统SEO可以排名，但不保证AI搜索能理解。

### 1.2 富摘要的定义
- 富摘要 (Rich Snippets) 是Google/Baidu在搜索结果中**增强展示内容**的一种形式。
- 包含：图片、评分、价格、作者、视频时长等。

示例：  
- Google搜索Udemy时显示的课程卡片和视频模块就是富摘要。

---

## 2. 课程封面与图片尺寸规范

### 2.1 为什么16:9最优
- 搜索引擎算法默认 **16:9** 作为视频封面或课程主图比例。
- 任何非16:9图片（如3:2、21:9）会被判定为装饰图，**不计权重**。

| 图片比例 | 识别度 | 用途 |
|----------|--------|------|
| **16:9** | ★★★★★ | 课程封面、视频封面 |
| 1:1 正方形 | ★★★ | 头像、Logo |
| 4:3, 3:2 | ★★ | 摄影图 |
| 异形、三角形 | ★ | 装饰图 |

### 2.2 尺寸标准
| 场景 | 最低标准 | 推荐 |
|------|----------|------|
| SEO/AEO 主图 | 1280×720 | 1920×1080 |
| 课程封面卡片图 | 300×169 | 使用srcset加载 |
| 缩略图 | 640×360 | - |

> **关键点**  
> - Google要求 `image` 宽度≥1200px，否则即使比例正确也不会展示富摘要。
> - 可以通过 `srcset` 同时提供多尺寸文件。

### 2.3 srcset 示例
```html
<img 
  src="course-card-300x169.webp"
  srcset="
    course-card-300x169.webp 300w,
    course-card-1280x720.webp 1280w,
    course-card-1920x1080.webp 1920w"
  alt="Tableau 数据分析课程封面">
```

---

## 3. Udemy 课程卡片与结构化设计

### 3.1 课程卡片结构
课程卡片真实HTML结构：  
```html
<div class="course-card">
  <!-- 上半部分：16:9封面图 -->
  <div class="course-card-image">
    <img src="ccna-course-1280x720.jpg" alt="CCNA课程封面">
  </div>

  <!-- 下半部分：文字区域 -->
  <div class="course-card-body">
    <h3>课程标题</h3>
    <p class="instructor">讲师名</p>
    <div class="rating">⭐⭐⭐⭐⭐ (865)</div>
    <div class="price">US$49.99</div>
  </div>
</div>
```

- 整体卡片 = **上图 + 下文字** 的一个完整容器。  
- 下文字区域通过 CSS 设置透明背景，视觉上看似“裸文字”。

### 3.2 后台高清图策略
- 前端展示的小图仅300×169，保证加载速度。
- **后台绑定一张1280×720高清图**，供Google/Baidu抓取。

示例结构化数据：
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "CCNA++ 2025 最新CCNA视频教程",
  "image": "https://udemycdn.com/course-cover/ccna-1280x720.webp",
  "provider": {
    "@type": "Organization",
    "name": "Udemy",
    "url": "https://www.udemy.com"
  }
}
```

---

## 4. 首页轮播图与SEO图像策略

### 4.1 轮播图双图策略
| 目标 | 前端视觉轮播 | 后端SEO抓取 |
|------|--------------|-------------|
| 比例 | 21:9、3:1 等任意超宽 | **16:9 严格1280×720** |
| 用户体验 | 美观，视觉冲击力 | - |
| 搜索权重 | 无SEO效果 | 被Google识别为主图 |

实现方式：  
- 前端显示：`banner-2100x700.webp`  
- 后端绑定：`banner-1280x720.webp`

### 4.2 HTML & Schema示例
```html
<meta property="og:image" content="https://uaiedu.com/images/seo-banner-1280x720.jpg">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "image": "https://uaiedu.com/images/seo-banner-1280x720.jpg"
}
</script>
```

---

## 5. 结构化数据实现示例

### 5.1 Course 类型
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "AI+Logo设计课程",
  "description": "从零基础到实战，掌握AI+Logo设计技能，成为高薪自由设计师。",
  "image": "https://uaiedu.com/images/course-cover/logo-ai-1280x720.jpg",
  "provider": {
    "@type": "Organization",
    "name": "UAI学院",
    "url": "https://uaiedu.com"
  }
}
```

### 5.2 VideoObject 类型
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Udemy个人计划评测 - 2025",
  "description": "Udemy订阅服务详细解析",
  "thumbnailUrl": "https://uaiedu.com/videos/udemy-review-1280x720.jpg",
  "uploadDate": "2024-09-01",
  "duration": "PT8M49S",
  "contentUrl": "https://uaiedu.com/videos/udemy-review"
}
```

---

## 6. Google 检测与问题解释

### 6.1 检测首页未发现富摘要
截图结果显示：
> “未检测到项目”

原因：  
1. 你检测的是 **首页**，而首页只输出 `WebSite` 基础数据，没有输出 `Course` 或 `VideoObject`。  
2. 课程的结构化数据在 **课程详情页** 才完整输出。

### 6.2 验证建议
- 在课程详情页运行 Rich Results Test  
- 如果检测到 `Course` + `Review` + `Offer`，说明结构化数据配置完整。

### 6.3 AEO 适配现状
- Udemy 传统 SEO 做得很好，但首页没有完整的实体化结构化数据。
- AI 搜索（AEO）更需要课程、讲师、视频等实体化输出，因此 Udemy仍在过渡阶段。

---

## 总结
1. **所有用于SEO/AEO的主图必须严格16:9且≥1280×720**  
2. 前端可展示小图，后台绑定高清图给搜索引擎  
3. 首页轮播图只做视觉，不计SEO权重，后台需双图策略  
4. 结构化数据应包含 `Course`、`VideoObject`、`Organization` 等实体  
5. 通过 Google Rich Results Test 验证配置效果
