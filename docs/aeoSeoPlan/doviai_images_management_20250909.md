
# 多维AI课堂前端图片管理与部署方案总结（2025-09-09）

> 本文总结了从“不同分辨率的图片放不同的文件夹？”开始到今天结束的所有讨论，涵盖了前端图片管理、SEO/AEO优化、hash文件命名、公共目录设计、Nginx部署映射等内容。

---

## 1. 不同分辨率图片分文件夹管理

**问题：** 是否需要为不同分辨率的图片建立不同的文件夹？

### **结论：**
建议**分文件夹管理**，更清晰，也方便 OSS/CDN 配置缓存和权限。

```
public/
└── images/
    ├── course/                # 课程封面主目录
    │   ├── 300/               # 移动端小图
    │   │   ├── ai-design.webp
    │   ├── 1280/              # 标准图
    │   │   ├── ai-design.webp
    │   └── 1920/              # 高清图
    │       ├── ai-design.webp
    └── logo/                   # 网站 LOGO
```

**对应 URL 示例：**
- 小图：`https://static.doviai.com/images/course/300/ai-design.webp`
- 标准图：`https://static.doviai.com/images/course/1280/ai-design.webp`
- 高清图：`https://static.doviai.com/images/course/1920/ai-design.webp`

### **srcset 配合示例**
```html
<img
  src="https://static.doviai.com/images/course/1280/ai-design.webp"
  srcset="
    https://static.doviai.com/images/course/300/ai-design.webp 300w,
    https://static.doviai.com/images/course/1280/ai-design.webp 1280w,
    https://static.doviai.com/images/course/1920/ai-design.webp 1920w"
  sizes="(max-width: 768px) 300px, (max-width: 1440px) 1280px, 1920px"
  alt="AI 设计课程封面"
/>
```

---

## 2. 脚本批量生成三档图片

### **需求：**
将一张 16:9 的原始图片批量生成三种规格：
- 300×169
- 1280×720
- 1920×1080

### **Node.js 脚本示例：**
```js
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '../public/images/course/source');
const outputBaseDir = path.join(__dirname, '../public/images/course');

const sizes = [
  { name: '300', width: 300 },
  { name: '1280', width: 1280 },
  { name: '1920', width: 1920 }
];

async function generateImages() {
  const files = fs.readdirSync(sourceDir).filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  if (files.length === 0) {
    console.log('⚠️ 没有找到原始图片，请将16:9原图放到 source 文件夹');
    return;
  }

  for (const file of files) {
    const baseName = path.parse(file).name;
    const inputPath = path.join(sourceDir, file);

    for (const size of sizes) {
      const outputDir = path.join(outputBaseDir, size.name);
      fs.ensureDirSync(outputDir);
      const outputPath = path.join(outputDir, `${baseName}.webp`);

      await sharp(inputPath)
        .resize(size.width, Math.round(size.width * 9 / 16))
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`✔ 生成: ${outputPath}`);
    }
  }

  console.log('🎉 所有图片已生成完成！');
}

generateImages().catch(err => console.error(err));
```

运行后，生成结构如下：
```
public/images/course/
├── 300/ai-design.webp
├── 1280/ai-design.webp
└── 1920/ai-design.webp
```

---

## 3. 文件名加 hash 控制缓存

**目的：** 当图片内容更新后，浏览器和 CDN 能立即拉取新文件，避免看到旧版本。

### **示例文件名：**
```
300/ai-design.3f5c1a.webp
1280/ai-design.3f5c1a.webp
1920/ai-design.3f5c1a.webp
```

### **生成 hash 脚本**
```js
const crypto = require('crypto');
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
  return hash.slice(0, 8);
}
```

输出文件名：
```
ai-design.3f5c1a.webp
```

**好处：**
1. CDN 缓存可设 1 年，文件更新自动生效。
2. 搜索引擎看到新文件名，会立即重新抓取。
3. 无需手动刷新 CDN。

---

## 4. 图片资源放 public 还是 src/assets

| 资源类型 | 位置 | 原因 |
|----------|------|------|
| **课程封面、SEO图** | `public/images` | 搜索引擎直接抓取，URL 固定 |
| **小图标、内部UI装饰** | `src/assets/icons` | 不需 SEO 抓取，打包工具优化 |
| **测试素材** | `public/images/temp` + robots.txt 屏蔽 | 防止被抓取 |

**robots.txt 示例：**
```txt
User-agent: *
Disallow: /images/temp/
Allow: /images/course/
```

---

## 5. public 目录标准模板

```
public/
├── images/
│   ├── course/       # 课程封面（SEO/AEO核心资源）
│   │   ├── 300/
│   │   ├── 1280/
│   │   └── 1920/
│   ├── banner/       # 轮播大图
│   ├── logo/         # LOGO与社交分享图
│   └── temp/         # 测试图片（屏蔽抓取）
├── favicon.ico
├── manifest.json
├── robots.txt
└── sitemap.xml
```

---

## 6. robots.txt 和 sitemap.xml

- **robots.txt** 和 **sitemap.xml** 必须放在网站根目录，路径如下：  
  - `https://www.doviai.com/robots.txt`
  - `https://www.doviai.com/sitemap.xml`

### robots.txt 示例
```txt
User-agent: *
Disallow: /images/temp/       # 禁止抓取测试图片
Allow: /images/course/        # 允许抓取课程封面

Sitemap: https://www.doviai.com/sitemap.xml
```

### sitemap.xml 示例
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.doviai.com/course/python-basic</loc>
    <lastmod>2025-09-10</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>
```

**作用：**
- robots.txt 控制搜索引擎抓取范围。
- sitemap.xml 提供页面结构，便于搜索引擎快速收录。

---

## 7. ECS 部署与网站根目录映射

当部署到阿里云 ECS 时，需要通过 Nginx 配置映射 `public/` 为网站根目录。

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name www.doviai.com doviai.com;

    root /var/www/doviai/frontend/public;

    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location = /robots.txt {
        root /var/www/doviai/frontend/public;
    }

    location = /sitemap.xml {
        root /var/www/doviai/frontend/public;
    }

    location /images/ {
        root /var/www/doviai/frontend/public;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

部署后路径映射：
```
https://www.doviai.com/robots.txt
=> /var/www/doviai/frontend/public/robots.txt
```

---

## 8. 今日总结核心要点

| 主题 | 结论 |
|------|------|
| **分文件夹管理** | 300/1280/1920 独立文件夹，清晰且适合 SEO |
| **自动生成图片** | 使用 Node.js + Sharp 批量生成三档图片 |
| **文件名 hash** | 自动缓存更新，SEO 爬虫高效抓取 |
| **public vs src/assets** | SEO 相关放 public，UI 私有图放 src/assets |
| **robots.txt / sitemap.xml** | 必须在网站根目录 |
| **ECS 部署** | 通过 Nginx root 指令映射 public 目录 |

---

**最终目标：**  
1. 课程封面与 SEO 图片被高效抓取，支持 Google/Bing/百度。  
2. 前端和 CDN 缓存管理完全自动化。  
3. 未来部署 ECS、OSS、CDN 时无需重构前端代码。
