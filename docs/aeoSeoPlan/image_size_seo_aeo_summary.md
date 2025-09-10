
# 图片尺寸与使用细节总结 (SEO / AEO 适配)

> 适用于多维AI课堂 (www.doviai.com) 前端与SEO/AEO项目

---

## 1. 不同搜索引擎对图片的抓取标准

| 搜索引擎 | 最低合格尺寸 | 推荐高清尺寸 | 备注 |
|----------|--------------|--------------|------|
| **百度** | **1280×720** 严格16:9 | 不超过 1280×720 | 超过此尺寸无额外加分 |
| **Google** | ≥1200px宽，最低 1280×720 | **1920×1080** | 高清图触发富摘要、SGE卡片 |
| **Bing** | ≥1200px宽 | **1920×1080** | 与Google标准一致 |

**核心结论：**
- 百度只需 **1280×720**，不必提供超大图。
- Google/Bing 为确保 AI 搜索 (SGE) 效果，建议 **1920×1080** 高清图。

---

## 2. Retina (Mac) 与多分辨率支持

| 设备类型 | DPR倍数 | 推荐图档位 |
|----------|----------|------------|
| 普通屏 | 1x | 1280×720 |
| Mac Retina / 常见4K屏 | 2x | **1920×1080** |
| 高端5K/6K显示器 | 3x (可选) | 2560×1440 或更高 |

> **通常只需准备 1280 + 1920 两档**，满足 99% 场景。

---

## 3. `srcset` 前端代码示例

```html
<img
  src="https://static.doviai.com/images/course-1280x720.webp"
  srcset="
    https://static.doviai.com/images/course-300x169.webp 300w,
    https://static.doviai.com/images/course-1280x720.webp 1280w,
    https://static.doviai.com/images/course-1920x1080.webp 1920w"
  sizes="(max-width: 768px) 300px, (max-width: 1440px) 1280px, 1920px"
  alt="AI 设计课程封面图"
/>
```

- **300w**：移动端弱网/列表缩略图。
- **1280w**：标准图，满足百度及普通屏。
- **1920w**：高清图，满足Mac Retina + Google/Bing 高清卡片。
- 浏览器会自动根据**屏幕分辨率和网络条件**选择最优图片。

---

## 4. 结构化数据绑定示例 (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "AI设计课程",
  "image": "https://static.doviai.com/images/course-1920x1080.webp",
  "provider": {
    "@type": "Organization",
    "name": "多维AI课堂",
    "url": "https://www.doviai.com"
  }
}
```
- `image` 字段必须绑定**最高分辨率版本** (1920×1080)，以保证 Google/Bing 在 AI 搜索卡片中展示高清图。
- 百度只会识别 ≤1280×720 版本。

---

## 5. 性能优化建议

| 技术 | 作用 |
|------|------|
| **WebP/AVIF 格式** | 体积比 JPEG 小 40-60%，加载快 |
| **CDN 加速** | 全球分发，降低延迟 |
| **Lazy Load 懒加载** | 首屏只加载可见图片 |
| **缓存策略** | 文件名加指纹，HTTP Header 设置 `Cache-Control: immutable` |
| **占位符技术** | 先加载小模糊图，提升感知速度 |

---

## 6. 阶段性落地策略

| 阶段 | 做法 |
|------|------|
| **现在 (Vercel+Railway，无OSS)** | 先产出 1280 + 1920 两档，`srcset` 只列真实存在的文件 |
| **接入OSS/CDN后** | 域名 CNAME 切到 OSS，未来可扩展 300/640 等更多档位 |
| **正式运营期** | 结构化数据永远指向 1920 高清图；前端按需加载，CDN 缓存优化 |

---

## 7. 总结

1. 百度抓取上限 1280×720，Google/Bing 最佳为 1920×1080。
2. Retina 屏至少需要 1920 档保证清晰。
3. `srcset` 提供多尺寸，浏览器自动切换，兼顾 SEO 与性能。
4. 结构化数据的 `image` 字段始终指向最高分辨率图。
5. 必须结合 CDN + WebP + 懒加载优化加载速度。

