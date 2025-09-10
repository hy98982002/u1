
# AEO / SEO 与课程视频优化总结（2025-09-06）

## 1. B 站视频嵌入网站
- 可以将 B 站课程介绍视频嵌入到 **uaiedu.com** 网站中播放，不会消耗自己服务器的流量。
- 通过 `<iframe>` 嵌入 B 站官方播放器，视频文件走 B 站 CDN，不占用带宽。
- 建议使用 **Bootstrap `ratio-16x9`** 保证响应式效果。
- 视频下方可以提供备用跳转链接，指向 B 站原视频。

### 示例代码（HTML）
```html
<div class="ratio ratio-16x9 my-3">
  <iframe
    src="https://player.bilibili.com/player.html?bvid=BV1xx1111yyy&p=1&high_quality=1&danmaku=0"
    title="课程介绍"
    loading="lazy"
    allow="autoplay; fullscreen; clipboard-read; clipboard-write"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin">
  </iframe>
</div>
```

---

## 2. 封面比例与 SEO
- **视频封面必须使用 16:9**（1280×720 或 1920×1080）以适配 B 站播放器和搜索引擎视频卡片展示。
- 如果课程卡片只是静态封面，不强制 16:9，但建议后台保留一份 16:9 封面供 SEO 使用。
- JSON-LD 中的 `thumbnailUrl` 应提供 16:9 封面图。

```json
"thumbnailUrl": [
  "https://www.uaiedu.com/img/course-cover-1280x720.webp"
]
```

---

## 3. 搜索引擎抓取课程卡内容
- 搜索引擎抓取的是**封面图 + HTML 文本信息**，不会抓取整个课程卡截图。
- 封面图来自 `<img>` 或 JSON-LD `image` 字段。
- 课程标题、价格、评分等需在 JSON-LD 中明确标记。

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "AI 设计入门",
  "image": "https://www.uaiedu.com/img/course-cover-1280x720.webp",
  "provider": {
    "@type": "Organization",
    "name": "UAIEDU"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD"
  }
}
```

---

## 4. 星级评分系统
- 只有 1 人评价 5 星，平均分就是 5.0，但 Google 不会信任，**至少需要 5 条评分**后才会稳定显示星级。
- JSON-LD 示例：
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "5.0",
  "ratingCount": "1",
  "reviewCount": "1"
}
```
- 恶意低分防护需要复杂的风控系统，包括：进度限制、IP 频控、加权算法等。
- **MVP 阶段不建议上线评分系统**，只需在数据库记录，不对外展示。

---

## 5. 讲师姓名选择
| 类型 | SEO / AEO 效果 | 建议 |
|------|----------------|------|
| **真名** | 权威度最高，易于进入知识图谱 | 长期最优 |
| **笔名** | 可积累品牌价值，但需要长期运营 | MVP 阶段可用 |
| **网名** | 权威度低，搜索引擎无法识别 | 不推荐 |

在 `schema.org` 中可以用 `alternateName` 同时写真名和笔名：
```json
"provider": {
  "@type": "Person",
  "name": "Haitao Wang",
  "alternateName": "王海涛"
}
```

---

## 6. 真人出镜的影响
| 出现位置 | SEO 提升 | AEO 提升 |
|----------|----------|----------|
| **封面有人像** | ⭐⭐ | ⭐⭐ |
| **视频中真人讲解** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **封面 + 视频双重真人** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

- **视频真人出镜**对搜索引擎判断内容可信度作用最大。
- 轻度美颜或皮肤润色完全安全，但**过度美颜会降低可信度**，可能被识别为虚拟内容。

---

## 7. 搜索引擎如何判断视频中的真人
搜索引擎不会“观看视频”，而是通过以下技术判断：
1. **视频元数据**：标题、描述、上传时间、长度等。
2. **语音识别**：检测语音自然度，识别真人讲解。
3. **关键帧分析**：检测人脸、嘴型同步、真实场景。
4. **用户行为**：观看时长、跳出率、互动率。

配合 JSON-LD `VideoObject`，可精准描述课程视频：
```json
{
  "@type": "VideoObject",
  "name": "AI 设计零基础入门",
  "description": "UAIEDU 课程，由王海涛老师真人讲解。",
  "thumbnailUrl": "https://www.uaiedu.com/img/course-cover-1280x720.webp",
  "uploadDate": "2025-09-06",
  "duration": "PT5M30S",
  "embedUrl": "https://player.bilibili.com/player.html?bvid=BV1xx1111yyy",
  "publisher": {
    "@type": "Person",
    "name": "王海涛"
  }
}
```

---

## 8. MVP 阶段重点策略
1. 不上线评分系统，只记录数据；
2. 课程视频中保证至少 30 秒真人出镜；
3. 上传封面图为真人半身照，保持 16:9；
4. 前端嵌入 B 站 iframe 播放，节省流量；
5. JSON-LD 提供完整结构化数据，支持 SEO 与 AEO。

---

## 总结
- **视频中真人出镜**是 SEO 与 AEO 的核心加分项；
- 封面 16:9 是搜索引擎视频卡片和播放器适配的基础要求；
- 评分系统 MVP 阶段不做，避免恶意评分影响 SEO；
- 讲师信息建议使用真名或笔名组合，并在结构化数据中标注。

---

## In short
- B 站嵌入视频不占用你服务器流量；
- 课程封面和视频优先真人出镜，且使用 16:9；
- MVP 阶段不上线评分系统；
- 讲师信息使用真名，配合 `schema.org` 绑定。
