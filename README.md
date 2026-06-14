# skipper.tw - 台灣帆船活動公告欄

一個純前端的台灣帆船活動與課程資訊公告平台。

## 功能特性

- ✅ 活動列表展示
- ✅ 課程列表展示
- ✅ 搜尋功能（名稱、地點、描述）
- ✅ 篩選功能（地區、類型）
- ✅ 響應式設計（支援手機、平板、桌面）
- ✅ 外部連結跳轉

## 技術棧

- **前端框架**: Vue.js 3
- **構建工具**: Vite + vite-ssg
- **樣式框架**: Tailwind CSS
- **路由**: Vue Router
- **部署**: GitHub Pages
- **SEO 優化**: ✅ 已實施（SSG、Meta Tags、Canonical、Sitemap、Robots.txt）

## 開發說明

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

開啟瀏覽器訪問 http://localhost:5173/

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 資料結構

### 活動資料 (activities.json)

```json
{
  "activities": [
    {
      "id": 1,
      "title": "活動名稱",
      "type": "workshop",
      "region": "北台灣",
      "date": "2026-07-15",
      "location": "基隆",
      "unit": "樂活帆船協會",
      "price": 2500,
      "contact": "0912-345-678",
      "description": "活動描述",
      "url": "https://..."
    }
  ]
}
```

### 課程資料 (courses.json)

```json
{
  "courses": [
    {
      "id": 1,
      "title": "課程名稱",
      "organization": "ASA",
      "level": "beginner",
      "unit": "樂活帆船",
      "region": "北台灣",
      "date": "2026-07-01",
      "location": "福隆",
      "price": 15000,
      "contact": "03-999-8888",
      "description": "課程描述",
      "url": "https://..."
    }
  ]
}
```

## 新增/編輯資料

1. 編輯 `public/data/activities.json` 或 `public/data/courses.json`
2. 確保每個項目有唯一的 `id`
3. 重新啟動伺服器或刷新頁面即可看到更新

## 頁面說明

- **首頁** (/)：展示即將開始的活動和熱門課程
- **活動頁** (/activities)：所有帆船活動列表，可搜尋和篩選
- **課程頁** (/courses)：所有帆船課程列表，可搜尋和篩選
- **學校頁** (/schools)：帆船學校列表
- **學校詳細頁** (/schools/:id)：單一學校課程與活動資訊

## 貢獻

歡迎提出 Issue 或 Pull Request！

## 授權

MIT License
