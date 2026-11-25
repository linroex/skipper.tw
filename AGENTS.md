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
│   ├── COURSE_DATA_GUIDE.md      # 新增課程／活動資料的完整規則（以此為準）
│   └── PROJECT_PLAN.md           # 專案規劃文件
│
├── public/                       # 靜態資源
│   ├── data/                     # JSON 資料檔案
│   │   ├── activities.json       # 活動資料
│   │   ├── courses.json          # 課程資料
│   │   ├── practice.json         # 帆船練習（依碼頭整理的課後練習與包船方案）
│   │   ├── races.json            # 比賽（歷年場次與各校報名資訊）
│   │   ├── regions.json          # 地區列表
│   │   ├── schools.json          # 主辦單位（學校／俱樂部／社團）
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
      "id": 16,
      "title": "活動名稱",
      "type": "workshop/voyage/race/camp/social/seminar",
      "unit": "主辦單位（須與 schools.json 的 name 完全一致）",
      "region": "北台灣/中台灣/南台灣/東台灣",
      "location": "地點名稱",
      "conditions": ["參加條件，如 6 歲以上、會員限定；無則 []"],
      "schedule": { "type": "fixed", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "note": "選填" },
      "duration": "選填，如 4 天 3 夜",
      "price": 數字或 null,
      "memberPrice": "選填，會員價",
      "priceText": "選填，覆蓋價格顯示",
      "contact": "聯絡方式",
      "description": "活動描述",
      "url": "外部連結"
    }
  ]
}
```

**字段說明**:
- `type`: 活動類型（`workshop` 體驗課程／`voyage` 航行／`camp` 夏令營／`social` 聯誼／`seminar` 講座）。**比賽不放在活動裡**，請放 `races.json`（見下）
- `conditions`: 參加條件（顯示用文字），取代舊的 `audience`／`prerequisites`
- `schedule.type`: 排程型態
  - `fixed`：固定日期（`startDate`/`endDate`，單日兩者相同）
  - `recurring`：多梯次（`sessions` 日期陣列）
  - `flexible`：揪團成行（`windowStart`/`windowEnd`/`minParticipants`，顯示在「隨時揪團成行」區）
- `price`: 價格（NT$），需洽詢用 `null`
- `url`: 外部連結；來源是 FB 貼文時放貼文永久連結

完整規則與範例見 `docs/COURSE_DATA_GUIDE.md`。

**活動的顯示規則**:
- 活動頁、首頁、單位列表頁只顯示「尚未結束」的活動（多梯次看最後一梯、揪團看開放區間結束日）
- 已結束的活動不會刪除，保留在資料裡當歷史；使用者在單位頁（`/schools/<id>/`）的「相關活動」區按「顯示過去活動」才會看到（新到舊、變淡）
- 課程則在課程頁用「顯示過去一年」開關查看過去的梯次

### 1-1. 比賽資料 (`public/data/races.json`)

比賽每年都會舉辦，而且同一場比賽常有多所學校組隊參加，所以獨立成「比賽」專區（`/races/`、`/races/<id>/`），不放在活動裡。主辦單位不必是學校。

```json
{
  "races": [
    {
      "id": "kaohsiung-international",
      "name": "高雄國際帆船賽",
      "organizer": "高雄市政府海洋局",
      "location": "高雄港外海至蚵仔寮海域",
      "description": "簡介",
      "editions": [
        {
          "label": "#3",
          "startDate": "2026-11-13",
          "endDate": "2026-11-13",
          "dateStatus": "選填：planned（協會年初行事曆預定，實際可能略有不同）／tentative（尚無官方公告的預計日期）",
          "location": "選填，與比賽預設地點不同時才寫",
          "note": "選填，這一屆的補充說明",
          "url": "選填，官方公告或回顧文章",
          "links": [{ "label": "競賽公告（NOR）", "url": "https://..." }],
          "registration": { "deadline": "2026-05-25", "feeText": "費用說明", "note": "補充", "url": "競賽規程連結" },
          "entries": [
            {
              "unit": "樂活海洋",
              "role": "組隊",
              "price": 3000,
              "memberPrice": 2000,
              "priceText": "選填，會覆蓋價格顯示",
              "deadline": "2026-10-15",
              "capacity": "8 席",
              "requirements": "參加條件",
              "contact": "LINE：https://lin.ee/xxx",
              "note": "補充",
              "url": "報名貼文連結"
            }
          ]
        }
      ]
    }
  ]
}
```

**欄位說明**:
- `id`: 網址用，小寫英文與連字號（例如 `hanse-cup`）
- `organizer`: 主辦單位，純文字、選填（不確定就不要寫）
- `website`: 比賽官方網站，選填（詳情頁顯示「官方網站 →」）
- `editions`: 各年度場次，不論過去或未來都放這裡，同一年可以有多場（例如漢斯盃一年多站）。`label` 選填，用來區分同年的不同場次
- `registration`: 該屆的「官方報名資訊」（費用、截止日、規程連結），不屬於任何學校，選填
- `dateStatus`: 日期狀態標記，詳情頁會顯示「預定日期」或「預計」
- `entries`: 各學校的組隊／報名資訊，選填；`unit` 要與 `schools.json` 的 `name` 完全一致（單位頁才會出現「參加的比賽」）。只有沒有報名資訊的過去場次，`entries` 放 `[]`
- `role`: 例如「主辦」「組隊」
- 價格欄位規則同活動（`price`／`memberPrice`／`priceText`），會員優惠價顯示為「會員 $x」

**收錄原則**: 有開放他人報名參加的比賽才收；只有教練團自己出賽、沒有開放報名的不收；小艇、風浪板、樂觀型等選手導向的賽事不收（本站以重型帆船與一般人能參加的比賽為主）。歷年場次盡量往前收五年，日期優先用實際舉辦日，其次才是協會年度行事曆的預定日期（標 `planned`）；查不到的年份不要猜。

**列表分組**（`/races/`）: 有未結束場次 →「即將舉行」；今年已辦完 →「今年已舉辦・明年可以提前準備」；今年還沒有場次 →「今年尚未公布」。後兩組依最近一次的月份排序，方便提早規劃。

### 1-2. 練習資料 (`public/data/practice.json`)

學員上完課之後最在意的是「去哪個碼頭練習」，所以獨立成「練習」專區（`/practice/`），以**碼頭**為單位，底下列出各家的練習與包船方案；學校名稱是次要資訊。常態、可預約的練習才放這裡，有固定日期的體驗與航行放活動，課程放課程。

```json
{
  "places": [
    { "id": "anping-agua", "name": "安平亞果遊艇碼頭", "city": "台南", "area": "安平", "address": "地址（選填）" }
  ],
  "offerings": [
    {
      "id": "lohas-friday-practice",
      "placeId": "anping-agua",
      "unit": "樂活海洋",
      "kind": "課後練習",
      "title": "週五會員日｜課後練習",
      "boat": "選填，例如 J/80",
      "schedule": "每週五 14:00–17:00，預約制",
      "duration": "3 小時",
      "price": 10000,
      "priceUnit": "boat",
      "capacity": 4,
      "priceText": "選填，會覆蓋價格顯示，例如「會員免費／一般 $3,000」",
      "topics": ["調帆練習", "碼頭停靠"],
      "contact": "(06) 299-8099",
      "note": "選填",
      "url": "詳情或粉專連結"
    }
  ]
}
```

- `places[].city`: 縣市（決定頁面分組與篩選，由北到南排序）；沒有任何方案的碼頭不會顯示
- `offerings[].placeId`: 對應 `places[].id`；`unit` 要與 `schools.json` 的 `name` 完全一致（單位頁才會出現「練習方案」）
- 包船方案用 `price`＋`priceUnit: "boat"`＋`capacity`，頁面會同時顯示「每船 $x（最多 N 人）」與「滿 N 人每人約 $y」，方便和課後練習比較
- 只收帆船；動力遊艇的駕駛訓練不收

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
      "price": 數字或 null,
      "memberPrice": "選填，校友／學員優惠價",
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
    {"id": "voyage", "name": "航行"},
    {"id": "race", "name": "帆船賽事"},
    {"id": "camp", "name": "夏令營"},
    {"id": "social", "name": "聯誼"},
    {"id": "seminar", "name": "講座"}
  ]
}
```

### 5. 主辦單位 (`public/data/schools.json`)

- `type`: `school`（帆船學校）／`club`（遊艇俱樂部／遊艇業者）／`community`（社團揪團）
- `certs`: 認證組織陣列，沒有認證課程可為 `[]`
- `links`: 單位連結物件，可含 `website`／`facebook`／`instagram`／`line`（完整網址，有才顯示）；單位頁與列表頁依此顯示。活動／課程自己的 `url` 則是來源貼文或報名頁，不必與單位連結相同
- 新增活動前，`unit` 必須先存在於此檔，否則單位頁不會出現

---

## 路由配置

| 路由 | 頁面 | 組件 |
|------|------|------|
| `/` | 首頁 | `Home.vue` |
| `/activities` | 活動列表 | `Activities.vue` |
| `/practice` | 帆船練習（依碼頭） | `Practice.vue` |
| `/races` | 比賽列表 | `Races.vue` |
| `/races/:id` | 比賽詳情（各年度與各校報名資訊） | `Race.vue` |
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
- 活動類型：必須是預定義的類型之一（workshop/voyage/race/camp/social/seminar）
- 課程等級：必須是預定義的等級之一（beginner/intermediate/advanced）

### 讀取 Facebook 貼文（headless browser）
環境沒有內建瀏覽器工具，WebFetch 對 FB 通常只拿到登入頁。公開貼文可用 Playwright 讀取：

```bash
# 裝在 scratchpad 或專案外，不要污染專案依賴
mkdir -p <tmp>/pw && cd <tmp>/pw && npm init -y && npm i playwright && npx playwright install chromium
# 腳本：chromium.launch() → newContext({ locale: 'zh-TW' }) → goto(分享連結) → waitForTimeout(5000) → innerText('body')
```

- `facebook.com/share/p/...` 會轉址到 `story.php?story_fbid=...&id=<粉專ID>`，貼文內容在 body 文字裡
- 貼文通常不含粉專連結，可從 `a[href]` 或 `link[rel=canonical]` 取得；粉專無自訂網址時用 `https://www.facebook.com/profile.php?id=<粉專ID>`
- 貼文永久連結格式：`https://www.facebook.com/permalink.php?story_fbid=<ID>&id=<粉專ID>`
- 私人或社團貼文仍會被登入牆擋住，改請站主貼文字或截圖

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
