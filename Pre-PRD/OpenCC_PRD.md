# OpenCC.js 前端简繁切换 PRD

## 背景
UAI 教育平台 (uaiedu.com) 目前只提供简体中文界面，但平台希望覆盖港澳台和海外繁体中文用户。  
为了降低初期开发成本，不拆分 API 路由（例如 /zh-cn/ 与 /zh-tw/），而是在前端通过 **OpenCC.js** 实现简繁即时转换，满足阅读体验。

---

## 目标
- 为所有页面提供 **简体/繁体切换功能**。
- 保持后端 API 和数据库内容统一为简体中文。
- 确保切换功能在 **Vue 前端项目 (Vite + Vue3 + Bootstrap5)** 中可直接使用。
- 未来可扩展为多语言（i18n 方案）。

---

## 功能需求

### 1. 页面级转换
- 默认显示简体中文（zh-CN）。
- 用户点击“繁体中文”按钮 → 前端调用 OpenCC.js，把页面内文字转换为繁体。
- 切换后需记住用户选择（localStorage / cookie），保证刷新后仍显示繁体。

### 2. 转换范围
- 静态页面文本（课程介绍、菜单、按钮）。
- 动态渲染文本（后端 API 返回的简体内容）。

### 3. 切换逻辑
- 提供切换按钮组件（简体 ↔ 繁体）。
- 默认简体 → 调用 `OpenCC.Converter({ from: 'cn', to: 'tw' })`。
- 繁体 → 调用 `OpenCC.Converter({ from: 'tw', to: 'cn' })`。

### 4. SEO 限制
- 本阶段 **不拆分路由**，搜索引擎只会收录简体中文。
- 繁体用户访问时仍然能手动切换阅读。

---

## 技术实现

### 1. 引入 OpenCC.js
- 使用 npm 安装：
  ```bash
  npm install opencc-js
  ```
- 或通过 CDN 引入：
  ```html
  <script src="https://cdn.jsdelivr.net/npm/opencc-js/dist/umd/full.js"></script>
  ```

### 2. Vue 示例组件
```vue
<script setup>
import OpenCC from "opencc-js";
import { ref, onMounted } from "vue";

const isTraditional = ref(false);
const converterToTW = OpenCC.Converter({ from: 'cn', to: 'tw' });
const converterToCN = OpenCC.Converter({ from: 'tw', to: 'cn' });

function toggleLanguage() {
  isTraditional.value = !isTraditional.value;
  const root = document.querySelector("#app");
  if (isTraditional.value) {
    root.innerHTML = converterToTW(root.innerHTML);
    localStorage.setItem("lang", "zh-TW");
  } else {
    root.innerHTML = converterToCN(root.innerHTML);
    localStorage.setItem("lang", "zh-CN");
  }
}

onMounted(() => {
  const saved = localStorage.getItem("lang");
  if (saved === "zh-TW") {
    isTraditional.value = true;
    toggleLanguage();
  }
});
</script>

<template>
  <button @click="toggleLanguage">
    {{ isTraditional ? "切换简体" : "切换繁体" }}
  </button>
</template>
```

---

## 非功能性需求
- **性能**：转换过程需 <200ms（页面大小 ≤ 200KB）。
- **兼容性**：支持现代浏览器（Chrome, Edge, Safari, Firefox）。
- **可扩展性**：未来支持多语言（如英文），可替换为 i18n JSON 文件结构。

---

## 未来规划
- 第二阶段：使用 i18n 方案，维护独立的 `zh-CN.json` 与 `zh-TW.json`。
- 第三阶段：SEO 优化，采用 `/zh-cn/` 和 `/zh-tw/` 路由，并配置 `<hreflang>` 标签。

---

## 风险与限制
- 当前实现仅做字形转换，不处理港澳台特有词汇（例：软件→軟體，邮箱→電子郵件）。
- SEO 效果有限，繁体用户搜索可能仍主要命中简体结果。
