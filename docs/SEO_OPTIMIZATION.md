# SEO / SSG 優化說明

## 概述

skipper.tw 已從 Vue SPA 改為 **Vue 3 + Vite SSG**。網站仍部署在 GitHub Pages，但建置時會預先產生各主要路由的 HTML，讓搜尋引擎與社群分享工具可以直接讀到頁面內容、標題與描述。

## 技術架構

- **架構類型**: Static Site Generation（SSG）+ client-side hydration
- **SSG 工具**: vite-ssg
- **Head 管理**: @unhead/vue
- **部署平台**: GitHub Pages
- **資料來源**: `public/data/*.json`，建置時由 `src/utils/data.js` 匯入

## 已實施的優化

### 1. 靜態 HTML 輸出

`npm run build` 會產出巢狀靜態頁面，例如：

- `/`
- `/courses/`
- `/activities/`
- `/schools/`
- `/schools/tms/`
- `/schools/dawnlightocean/`
- `/schools/seedmarine/`
- `/schools/lohas/`
- `/schools/sailwithalwayssunshine/`

### 2. 頁面級 SEO

每個主要頁面使用 `@unhead/vue` 在 SSG 階段輸出 head：

- title
- description
- keywords（首頁）
- canonical URL
- Open Graph URL / site name

### 3. Sitemap 自動產生

`npm run build` 會執行 `scripts/generate-sitemap.mjs`，自動輸出 `dist/sitemap.xml`，包含所有靜態頁與學校詳細頁。

### 4. GitHub Pages 自動重建

`.github/workflows/deploy.yml` 支援：

- push 到 `master` 時部署
- manual workflow dispatch
- 每日排程重建

每日重建很重要，因為課程與活動列表會根據「今天」過濾已結束項目；SSG 的 HTML 是建置當下的內容快照。

## 注意事項

### 日期敏感內容

課程與活動會依建置日期產生靜態 HTML。若資料或日期變化但沒有重新 build，搜尋引擎看到的內容可能不是最新狀態。因此需保留每日 GitHub Actions rebuild。

### client-side hydration

SSG 產出的 HTML 仍會在瀏覽器端 hydrate，以支援篩選、行事曆切換、localStorage 記憶檢視模式等互動功能。

### Sitemap 來源

`public/sitemap.xml` 不再使用；sitemap 由 build script 產生到 `dist/sitemap.xml`。

## 測試方式

```bash
npm run build
npm run preview
```

建議檢查：

- `dist/index.html` 內有首頁內容與正確 title
- `dist/courses/index.html` 內有課程名稱
- `dist/schools/{id}/index.html` 內有學校名稱與課程內容
- `dist/sitemap.xml` 包含所有學校頁
- preview 中 `/courses/`、`/schools/`、`/schools/tms/` 可正常開啟

## 後續可優化

- 加入 JSON-LD 結構化資料
- 增加每門課程的獨立頁面
- 增加 Open Graph 圖片
- 在 Google Search Console 送出 sitemap
