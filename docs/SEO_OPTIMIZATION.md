# SEO 優化說明

## 概述

skipper.tw 是一個 Vue.js SPA（單頁應用），部署在 GitHub Pages 上。為了確保搜尋引擎能正確抓取網站內容，已實施以下 SEO 優化策略：

## 技術架構

- **架構類型**: Vue.js 3 SPA (Client-Side Rendering)
- **部署平台**: GitHub Pages（純靜態托管）
- **SEO 策略**: 
  - 基礎 HTML meta tags（靜態）
  - 搜尋引擎 JavaScript 渲染（Google、Bing 等現代爬蟲）
  - Sitemap.xml
  - Robots.txt

## 已實施的優化

### 1. 基礎 Meta Tags
在 `index.html` 中設置了靜態的 SEO meta tags：
- 頁面標題（title）
- 描述（description）
- 關鍵字（keywords）
- Open Graph 標籤（og:title, og:description, og:type）
- Twitter Card 標籤
- Robots 指令（index, follow）
- Sitemap 連結

### 2. 頁面級 SEO
每個路由頁面使用 `@vueuse/head` 動態設置 SEO：

#### 首頁 (/)
- 標題：`skipper.tw - 台灣帆船活動與課程資訊公告平台`
- 描述：台灣帆船活動、課程、體驗、競賽資訊平台

#### 活動頁 (/activities)
- 標題：`帆船活動列表 - skipper.tw`
- 描述：查找台灣各地帆船體驗課程、競賽、營隊、講座等活動資訊

#### 課程頁 (/courses)
- 標題：`帆船課程列表 - skipper.tw`
- 描述：查找台灣各地帆船課程，包括 ASA、IYT、TSA 等認證課程

### 3. Sitemap
已建立 `sitemap.xml`，包含所有主要頁面：
- `/` - 首頁
- `/activities` - 活動列表
- `/courses` - 課程列表
- `/schools` - 學校列表

### 4. Robots.txt
已建立 `robots.txt`，允許所有搜尋引擎爬取網站：
```
User-agent: *
Allow: /

Sitemap: https://skipper.tw/sitemap.xml
```

## 搜尋引擎兼容性

### Google
✅ **完全支援**
- Google 能夠執行 JavaScript
- Google 能夠渲染 Vue.js SPA
- 建議使用 [Google Search Console](https://search.google.com/search-console) 提交網站

### Bing
✅ **完全支援**
- Bing 能夠執行 JavaScript
- Bing 能夠渲染 Vue.js SPA

### 其他搜尋引擎
⚠️ **部分支援**
- 部分小型搜尋引擎可能無法執行 JavaScript
- 建議使用 [Prerender.io](https://prerender.io/) 服務進行 SEO 優化（可選）

## 建議的後續優化

### 1. 提交網站給搜尋引擎
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

### 2. 監控 SEO 表現
- 使用 Google Search Console 查看索引狀態
- 使用 Google Analytics 追蹤網站流量
- 監控關鍵字排名

### 3. 內容優化
- 定期更新活動和課程資訊
- 優化頁面內容，增加關鍵字密度
- 增加內部連結結構

### 4. 性能優化
- 使用 [PageSpeed Insights](https://pagespeed.web.dev/) 檢查網站性能
- 優化圖片大小
- 使用 CDN 加速資源載入

### 5. 考慮 SSR/SSG（可選）
如果 SEO 需求較高，可考慮：
- 使用 **Nuxt.js**（Vue 3 的 SSR/SSG 框架）
- 使用 **VitePress**（靜態網站生成器）
- 使用 **Prerender.io** 服務

## 測試工具

### 1. SEO 檢查
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [SEO Site Check](https://www.seositecheckup.com/)

### 2. 結構化資料
- [Google Structured Data Testing Tool](https://search.google.com/test structured-data)

## 版本資訊

- **優化日期**: 2026-06-11
- **優化版本**: 1.0.0
- **技術棧**: Vue.js 3 + Vite + Tailwind CSS

---

*此文件供維護者參考，確保網站 SEO 持續優化。*
