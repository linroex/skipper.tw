# skipper.tw - 專案結構指南

本文件提供給 AI 智能助理（pi）了解專案結構的參考指南。

## 專案概述

**skipper.tw** 是一個純前端的台灣帆船活動與課程資訊公告平台。

- **目標**: 讓使用者方便地查找台灣各地的帆船活動與課程資訊
- **技術架構**: 純前端靜態網站，部署於 GitHub Pages
- **資料來源**: JSON 檔案（位於 `public/data/`）

---

## 目錄結構

```
skipper.tw/
├── .pi/                          # pi 智能助理配置目錄
│   └── skills/
│       └── search-xng/           # 網路搜尋技能
│           ├── SKILL.md          # 技能說明文件
│           └── references/
│               └── SEARCH_API.md # API 引用文件
│
├── docs/                         # 專案文件
│   └── PROJECT_PLAN.md           # 專案規劃文件
│
├── public/                       # 靜態資源
│   ├── data/                     # JSON 資料檔案
│   │   ├── activities.json       # 活動資料
│   │   ├── courses.json          # 課程資料
│   │   ├── regions.json          # 地區列表
│   │   └── types.json            # 活動類型定義
│   └── vite.svg                  # Vite 圖標
│
├── src/                          # Vue.js 來源程式碼
│   ├── assets/                   # 資源檔案（若需要）
│   ├── components/               # 可複用組件
│   │   ├── ActivityCard.vue      # 活動卡片組件
│   │   └── CourseCard.vue        # 課程卡片組件
│   ├── router/                   # 路由配置
│   │   └── index.js              # Vue Router 設定
│   ├── utils/                    # 工具函式
│   │   └── api.js                # API 呼叫封裝
│   ├── views/                    # 頁面組件
│   │   ├── Home.vue              # 首頁
│   │   ├── Activities.vue        # 活動列表頁
│   │   └── Courses.vue           # 課程列表頁
│   ├── App.vue                   # 主應用組件
│   └── main.js                   # 應用入口
│
├── index.html                    # HTML 入口
├── vite.config.js                # Vite 配置
├── tailwind.config.js            # Tailwind CSS 配置
├── postcss.config.js             # PostCSS 配置
├── package.json                  # Node.js 依賴與腳本
├── README.md                     # 專案說明
├── AGENTS.md                     # 本文件（AI 助理指南）
└── .gitignore                    # Git 忽略設定
```

---

## 核心技術棧

| 項目 | 技術 | 版本 |
|------|------|------|
| 前端框架 | Vue.js | 3.4+ |
| 構建工具 | Vite | 5.0+ |
| 樣式框架 | Tailwind CSS | 3.4+ |
| 路由 | Vue Router | 4.2.5+ |
| 部署 | GitHub Pages | - |

---

## 資料結構

### 1. 活動資料 (`public/data/activities.json`)

```json
{
  "activities": [
    {
      "id": 1,
      "title": "活動名稱",
      "type": "workshop/race/camp/seminar",
      "region": "北台灣/中台灣/南台灣/東台灣",
      "date": "YYYY-MM-DD",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "location": "地點名稱",
      "unit": "主辦單位",
      "price": 數字或 0,
      "contact": "聯絡方式",
      "description": "活動描述",
      "url": "外部連結"
    }
  ]
}
```

**字段說明**:
- `id`: 唯一識別碼
- `title`: 活動標題
- `type`: 活動類型
  - `workshop`: 體驗課程
  - `race`: 競賽
  - `camp`: 營隊
  - `seminar`: 講座
- `region`: 地區分類
- `date`: 活動日期（單日）
- `startDate/endDate`: 活動日期範圍
- `location`: 詳細地點
- `unit`: 主辦單位
- `price`: 價格（NT$，0 表示需洽詢）
- `contact`: 聯絡方式
- `description`: 活動描述
- `url`: 外部連結（選填）

### 2. 課程資料 (`public/data/courses.json`)

```json
{
  "courses": [
    {
      "id": 1,
      "title": "課程名稱",
      "organization": "ASA/IYT/TSA",
      "level": "beginner/intermediate/advanced",
      "region": "北台灣/中台灣/南台灣/東台灣",
      "date": "YYYY-MM-DD",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "location": "地點名稱",
      "unit": "主辦單位",
      "price": 數字或 0,
      "contact": "聯絡方式",
      "description": "課程描述",
      "url": "外部連結"
    }
  ]
}
```

**額外字段**:
- `organization`: 認證組織（ASA, IYT, TSA 等）
- `level`: 課程等級
  - `beginner`: 初學者
  - `intermediate`: 中級
  - `advanced`: 高級

### 3. 地區資料 (`public/data/regions.json`)

```json
{
  "regions": ["北台灣", "中台灣", "南台灣", "東台灣"]
}
```

### 4. 活動類型 (`public/data/types.json`)

```json
{
  "types": [
    {"id": "workshop", "name": "體驗課程"},
    {"id": "race", "name": "競賽"},
    {"id": "camp", "name": "營隊"},
    {"id": "seminar", "name": "講座"}
  ]
}
```

---

## 路由配置

| 路由 | 頁面 | 組件 |
|------|------|------|
| `/` | 首頁 | `Home.vue` |
| `/activities` | 活動列表 | `Activities.vue` |
| `/courses` | 課程列表 | `Courses.vue` |

**路由模式**: `createWebHistory()` (HTML5 History 模式)

---

## 核心組件說明

### App.vue
- 主應用框架
- 包含導航列、主內容區、頁尾
- 定義全局樣式（Tailwind）

### Home.vue
- 首頁內容
- 展示即將開始的活動（前 3 筆）
- 展示熱門課程（前 3 筆）
- 提供快速連結到活動/課程頁

### Activities.vue
- 活動列表頁面
- 包含搜尋與篩選功能
- 以卡片形式展示活動

### Courses.vue
- 課程列表頁面
- 包含搜尋與篩選功能
- 以卡片形式展示課程

### ActivityCard.vue / CourseCard.vue
- 可複用的卡片組件
- 展示基本資訊（標題、日期、地點、價格等）

---

## API 工具函式 (`src/utils/api.js`)

```javascript
// 獲取活動資料
fetchActivities() -> Promise<{ activities: Array }>

// 獲取課程資料
fetchCourses() -> Promise<{ courses: Array }>

// 獲取地區列表
fetchRegions() -> Promise<{ regions: Array }>

// 獲取活動類型定義
fetchTypes() -> Promise<{ types: Array }>
```

**注意**: 這些函式直接從 `/data/` 目錄獲取 JSON 檔案，無需後端 API。

---

## 開發指令

```bash
# 安裝依賴
npm install

# 開發模式（熱更新）- 已開啟 0.0.0.0
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 開發伺服器網路存取

Vite 配置已開啟 `0.0.0.0`，可從網路其他裝置存取：

- **本地網址**: `http://localhost:5173`
- **網路網址**: `http://<IP 位址>:5173`

**注意**：下次修改 `vite.config.js` 時，確保保留 `server.host: '0.0.0.0'` 設定，以便外部存取。

---

## 給 AI 助理的提示

### 新增活動/課程
1. 編輯 `public/data/activities.json` 或 `public/data/courses.json`
2. 確保每個項目有唯一的 `id`
3. 重新啟動伺服器或刷新頁面即可看到更新

### 修改功能
- **樣式修改**: 編輯 `src/views/` 或 `src/components/` 中的 Vue 組件
- **邏輯修改**: 編輯 `src/utils/api.js` 或 Vue 組件中的 `script setup`
- **新增頁面**: 在 `src/views/` 新增 Vue 組件，並在 `src/router/index.js` 新增路由

### 資料格式注意事項
- 日期格式：`YYYY-MM-DD`
- 價格：數字類型，0 表示需洽詢
- 地區：必須是預定義的區分之一（北台灣/中台灣/南台灣/東台灣）
- 活動類型：必須是預定義的類型之一（workshop/race/camp/seminar）
- 課程等級：必須是預定義的等級之一（beginner/intermediate/advanced）

### 搜尋技能使用
專案已整合 `search-xng` 技能，可用於：
- 網路搜尋查詢資訊
- 提取網頁內容
- 獲取搜尋建議

使用方式：
```bash
/search "查詢關鍵字"
/extract "網址"
/suggestions "部分查詢"
```

---

## 風格指南

### 色彩系統
```css
--primary: #0EA5E9 (天空藍)
--secondary: #0284C7 (深藍)
--accent: #F59E0B (橙色)
```

### 設計原則
- 清新海洋風格
- 大留白、卡片式設計
- 清晰的層級關係
- 行動優先（響應式設計）

---

## 版本資訊

- **專案版本**: 1.0.0
- **建立日期**: 2026-06-09
- **維護者**: Skipper.tw 團隊

---

*此文件供 AI 智能助理參考，幫助快速理解專案結構與開發流程。*
