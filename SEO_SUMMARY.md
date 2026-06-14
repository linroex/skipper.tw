# SEO / SSG 優化完成報告

## 專案概述

- **專案名稱**: skipper.tw - 台灣帆船活動與課程資訊公告平台
- **部署平台**: GitHub Pages
- **技術架構**: Vue.js 3 + Vite SSG

## 已完成項目

| 項目 | 狀態 | 位置 |
|------|------|------|
| Static Site Generation | ✅ 完成 | `vite-ssg` |
| 頁面級 SEO | ✅ 完成 | Vue 組件（`@unhead/vue`） |
| Canonical URL | ✅ 完成 | `src/App.vue` |
| Sitemap 自動產生 | ✅ 完成 | `scripts/generate-sitemap.mjs` → `dist/sitemap.xml` |
| GitHub Pages 部署 | ✅ 完成 | `.github/workflows/deploy.yml` |
| 每日自動重建 | ✅ 完成 | GitHub Actions schedule |
| Robots.txt | ✅ 完成 | `public/robots.txt` |

## SSG 輸出頁面

`npm run build` 會產生：

- `dist/index.html`
- `dist/courses/index.html`
- `dist/activities/index.html`
- `dist/schools/index.html`
- `dist/schools/{schoolId}/index.html`

目前學校詳細頁包含：

- `/schools/tms/`
- `/schools/dawnlightocean/`
- `/schools/seedmarine/`
- `/schools/lohas/`
- `/schools/sailwithalwayssunshine/`

## Sitemap

Sitemap 於 build 階段自動產生到 `dist/sitemap.xml`，包含首頁、課程、活動、學校列表與所有學校詳細頁。

## 注意事項

課程與活動會依「建置當天」判斷是否已結束，因此 GitHub Actions 已加入每日排程重建，避免搜尋引擎看到過期內容。

## 後續建議

1. 到 Google Search Console 提交 `https://skipper.tw/sitemap.xml`
2. 加入 JSON-LD 結構化資料
3. 增加每門課程的獨立 SSG 頁面
4. 增加 Open Graph 分享圖片
