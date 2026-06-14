# SSG + SEO 改造規劃

## 目標

把目前的 Vue SPA 改造成可部署在 GitHub Pages 的靜態生成網站（SSG），讓搜尋引擎與社群分享工具可以直接讀到每個頁面的完整 HTML、meta tags 與結構化資料。

## 現況

- 技術：Vue 3 + Vite + Vue Router + Tailwind CSS
- 部署：GitHub Pages
- 資料來源：`public/data/*.json`
- 路由：
  - `/`：課程首頁
  - `/courses`：課程列表
  - `/schools`：學校列表
  - `/schools/:id`：學校詳細頁
  - `/activities`：活動列表
- 目前 SEO：`index.html` 有基本 meta；各頁用 `@vueuse/head` 動態設定，但主要內容仍需瀏覽器執行 JS 後才出現。

## 建議方案

採用 **vite-ssg**，保留現有 Vue/Vite 架構，不改成 Nuxt。

原因：

1. 專案頁面數少、資料來源單純，vite-ssg 足夠。
2. 可以保留目前 Vue Router、元件與 Tailwind。
3. 改動範圍比 Nuxt 小，較適合漸進式改造。
4. GitHub Pages 可直接部署產生後的 `dist/`。

## 目標架構

```txt
src/
├── main.js               # 改成 createApp 工廠，供 SSG/CSR 共用
├── router/index.js       # 匯出 routes，支援 SSG 路由產生
├── utils/data.js         # 建議新增：build/runtime 共用資料讀取與整理
├── utils/seo.js          # 建議新增：SEO meta / JSON-LD helper
└── views/
    ├── Courses.vue
    ├── Schools.vue
    └── School.vue
```

建置後輸出：

```txt
dist/
├── index.html
├── courses/index.html
├── schools/index.html
├── schools/tms/index.html
├── schools/dawnlightocean/index.html
├── schools/seedmarine/index.html
├── schools/lohas/index.html
├── schools/sailwithalwayssunshine/index.html
├── sitemap.xml
└── robots.txt
```

## 實作階段

### Phase 1：導入 SSG 基礎

1. 安裝套件
   - `vite-ssg`
   - 視需要保留 `@vueuse/head`，或改用 `@unhead/vue`

2. 調整 `src/main.js`
   - 從 `createApp(App)` 改為 `ViteSSG(App, routerOptions, callback)`。
   - 確保 router 使用同一份 routes。

3. 調整 `src/router/index.js`
   - 匯出 `routes`。
   - 避免只 default export router，讓 vite-ssg 可重用。

4. 設定 SSG route generation
   - 靜態路由：`/`, `/courses`, `/schools`, `/activities`
   - 動態學校頁：從 `public/data/schools.json` 產生 `/schools/:id`

### Phase 2：資料讀取 SSG 化

目前頁面透過 `fetch('/data/*.json')` 取得資料；SSG 期間在 Node 環境執行時不適合依賴瀏覽器 fetch 路徑。

建議做法：

1. 新增 `src/utils/data.js`
   - 直接 import JSON：
     - `import coursesData from '../../public/data/courses.json'`
     - `import schoolsData from '../../public/data/schools.json'`
   - 匯出同步函式：
     - `getCourses()`
     - `getSchools()`
     - `getActivities()`
     - `getSchoolById(id)`

2. 原本 `src/utils/api.js` 可保留給未來 runtime fetch，但頁面優先改用同步資料。

3. 頁面從 `onMounted(async () => fetch...)` 改為 setup 階段即可取得資料。
   - 這是 SSG 的關鍵，否則產出的 HTML 仍可能沒有列表內容。

### Phase 3：SEO 與 Head 管理

每個可索引頁面都應在 SSG 時產出完整 head。

#### 全站

- `html lang="zh-TW"`
- canonical URL
- Open Graph URL
- Open Graph site name
- Twitter card
- robots

#### `/courses`

- title：`台灣帆船課程列表｜ASA、IYT、TSA 認證課程 - skipper.tw`
- description：包含課程數、地區、認證關鍵字
- JSON-LD：`ItemList`，列出近期課程

#### `/schools`

- title：`台灣帆船學校列表 - skipper.tw`
- description：包含學校數、認證與服務地區
- JSON-LD：`ItemList` 或 `Organization` list

#### `/schools/:id`

- title：`${school.name} 帆船課程與活動 - skipper.tw`
- description：學校簡介、認證、服務地區、課程數
- canonical：`https://skipper.tw/schools/${school.id}`
- JSON-LD：
  - `SportsActivityLocation` 或 `Organization`
  - `Event` / `Course` ItemList（可先做 ItemList）

### Phase 4：Sitemap 自動產生

目前 `public/sitemap.xml` 是手寫，缺少學校詳細頁。

建議新增腳本：`scripts/generate-sitemap.mjs`

輸出：`public/sitemap.xml` 或建置後輸出到 `dist/sitemap.xml`。

包含：

- `/`
- `/courses`
- `/schools`
- `/activities`
- `/schools/{id}` for each school

`lastmod` 可取：

1. 當天建置日期，或
2. Git commit 日期，或
3. 資料檔修改時間

初期可用建置日期即可。

### Phase 5：GitHub Pages 部署調整

1. `npm run build` 改成：

```json
{
  "build": "vite-ssg build && node scripts/generate-sitemap.mjs"
}
```

或先產 sitemap 再 build，依輸出位置決定。

2. 仍保留 `dist/404.html`
   - 雖然 SSG 已有實體頁面，GitHub Pages 仍建議保留 SPA fallback。
   - 若使用乾淨 URL，GitHub Pages 可直接服務 `/schools/tms/` 的 `index.html`。

3. 若未來部署在 repo subpath，仍需保留 `BASE_PATH` 機制。

### Phase 6：驗證

建置後需檢查：

1. `npm run build` 成功。
2. `dist/courses/index.html` 內可直接搜尋到課程名稱。
3. `dist/schools/tms/index.html` 內可直接搜尋到學校名稱與課程名稱。
4. 每頁有正確 title、description、canonical、og tags。
5. `dist/sitemap.xml` 包含所有學校頁。
6. `npm run preview` 手動確認頁面互動正常：
   - 課程列表篩選
   - 行事曆切換
   - 學校頁篩選
   - router-link 導航

## 風險與注意事項

### 1. Browser-only API

SSG 期間沒有 `window` / `document` / `localStorage`。

目前已有部分 guard：

```js
if (typeof window !== 'undefined') { ... }
```

需要全面檢查：

- `localStorage`
- `window`
- `document`
- `navigator`
- 任何 DOM 相關套件

### 2. 日期與 hydration 差異

課程列表與行事曆會根據「今天」判斷過去/未來。SSG 產生的 HTML 是建置當下的日期；使用者開啟頁面後 hydration 會用瀏覽器日期重新計算。

初期可接受；若要更嚴謹，需要：

- 每日自動 rebuild GitHub Pages，或
- 將「今天」統一由 build-time 注入，或
- 只讓 client 端處理日期敏感區塊。

建議：設定 GitHub Actions 每日自動 build 一次。

### 3. Head hydration

`@vueuse/head` 與 vite-ssg 需確認版本相容。若出現 head 未正確輸出，改用 `@unhead/vue`。

### 4. JSON import 路徑

從 `public/data` import JSON 可行，但語意上 `public` 通常是靜態公開資料。若未來要更乾淨，可搬到 `src/data` 或 `data` 目錄，再於建置時複製到 public。

初期為降低改動，不搬資料。

## 建議優先順序

1. 先做 `vite-ssg` 基礎與 routes generation。
2. 再把 Courses / Schools / School 的資料讀取改成 setup 同步資料。
3. 確認 HTML 內已有課程與學校內容。
4. 補齊 SEO meta 與 sitemap。
5. 最後補 JSON-LD。

## 驗收標準

- [ ] `npm run build` 產出每個主要路由的 HTML。
- [ ] `dist/schools/{id}/index.html` 存在。
- [ ] 關閉 JavaScript 時，課程列表/學校頁仍可看到核心內容。
- [ ] Google Rich Results Test 可讀到頁面標題、描述與結構化資料。
- [ ] sitemap 包含所有學校頁。
- [ ] GitHub Pages 部署後直接開啟 `/schools/tms/` 可正常顯示內容。

## 預估改動檔案

- `package.json`
- `src/main.js`
- `src/router/index.js`
- `src/utils/api.js` 或新增 `src/utils/data.js`
- `src/utils/seo.js`（新增）
- `src/views/Courses.vue`
- `src/views/Schools.vue`
- `src/views/School.vue`
- `src/views/Activities.vue`
- `scripts/generate-sitemap.mjs`（新增）
- `docs/SEO_OPTIMIZATION.md`（更新）
