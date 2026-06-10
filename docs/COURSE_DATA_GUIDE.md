# 課程與活動資料新增指南

本文檔說明如何正確新增課程和活動資料，以及格式處理規則。

## 新增流程

### 步驟 1：檢查學校是否存在

新增課程或活動前，先確認學校（`unit` 欄位）是否已存在於 `schools.json`：

```bash
# 檢查學校是否存在
1. 查看 public/data/schools.json
2. 確認 unit 名稱是否完全匹配
```

### 步驟 2：確認沒有重複

檢查是否已有相同單位的相同課程：

- 相同 `unit`（學校名稱）
- 相同 `title`（課程名稱）
- 相同 `startDate`（開始日期）
- 相同 `endDate`（結束日期）

### 步驟 3：新增資料到 JSON

#### 課程資料 (`public/data/courses.json`)

```json
{
  "id": 28,  // 使用下一個可用的唯一 ID
  "title": "ASA 101 基礎重型帆船課程",
  "organization": "ASA",  // 認證組織
  "level": "beginner",  // beginner/intermediate/advanced
  "region": "北台灣",  // 北台灣/中台灣/南台灣/東台灣
  "startDate": "2026-08-15",  // YYYY-MM-DD 格式
  "endDate": "2026-08-17",
  "location": "台北",  // 詳細地點
  "unit": "學校全名",  // 必須與 schools.json 中的 name 完全匹配
  "price": 0,  // 價格，0 表示需洽詢
  "contact": "聯絡方式",
  "description": "課程描述",
  "url": "https://example.com"
}
```

#### 活動資料 (`public/data/activities.json`)

```json
{
  "id": 50,  // 使用下一個可用的唯一 ID
  "title": "帆船體驗課程",
  "type": "workshop",  // workshop/race/camp/seminar
  "region": "北台灣",
  "date": "2026-09-20",  // 單日活動用此欄位
  "startDate": "2026-09-20",
  "endDate": "2026-09-20",
  "location": "台北",
  "unit": "學校全名",
  "price": 1500,
  "contact": "請洽詢學校",
  "description": "活動描述",
  "url": "https://example.com"
}
```

### 步驟 4：新增學校資料（如需要）

如果這是新的帆船學校，需要先新增到 `schools.json`：

```json
{
  "id": "新學校識別碼",  // 小寫，無空格
  "name": "學校全名",  // 必須與課程中的 unit 完全匹配
  "shortName": "簡短名稱",
  "description": "學校描述",
  "certs": ["ASA"],
  "locations": ["地點"]
}
```

## 格式處理規則

### 日期格式

- **必須格式**: `YYYY-MM-DD`（例如：`2026-08-15`）
- **單日活動**: `date`、`startDate`、`endDate` 都使用同一個日期
- **多日活動**: `startDate` 和 `endDate` 分別設定

### ID 生成規則

- **課程 ID**: 從 courses.json 中找最大的 ID，加 1
- **活動 ID**: 從 activities.json 中找最大的 ID，加 1
- **學校 ID**: 將學校名稱轉換為小寫，移除空格和特殊字元

**學校 ID 生成範例**:
```
"台中帆船學校" → "taichungsailingschool"
"晨光海洋 ASA 帆船學校" → "chenguanghaiangsasailing"
"TMS 台灣海洋帆船學校" → "tmstaiwanseasailing"
```

### 地區對應表

| 地點 | 地區 |
|------|------|
| 基隆、台北、新北、桃園、新竹、苗栗 | 北台灣 |
| 台中、彰化、南投、雲林 | 中台灣 |
| 嘉義、台南、高雄、屏東、澎湖、金門 | 南台灣 |
| 花蓮、宜蘭 | 東台灣 |

### 認證組織代碼

- `ASA`: American Sailing Association（美國帆船協會）
- `IYT`: International Yacht Training（國際游艇訓練）
- `TSA`: Taiwan Sailing Association（台灣帆船協會）

### 課程等級

- `beginner`: 初學者課程
- `intermediate`: 中級課程
- `advanced`: 高級課程

### 活動類型

- `workshop`: 體驗課程
- `race`: 競賽
- `camp`: 營隊
- `seminar`: 講座

### 價格欄位

- **數字**: 明確價格（例如：`1500`）
- **0**: 需洽詢學校價格

## 常見錯誤檢查

### ❌ 錯誤：學校名稱不匹配

```json
// courses.json
"unit": "TMS 台灣海洋帆船學校"

// schools.json（錯誤）
"name": "TMS 海洋學校"  // 名稱不同，無法顯示

// schools.json（正確）
"name": "TMS 台灣海洋帆船學校"  // 必須完全相同
```

### ❌ 錯誤：日期格式錯誤

```json
// 錯誤
"startDate": "2026/08/15"  // 斜線
"startDate": "2026-8-15"   // 單位數字

// 正確
"startDate": "2026-08-15"
```

### ❌ 錯誤：地區不在允許範圍

```json
// 錯誤
"region": "台灣北部"  // 不在允許範圍

// 正確
"region": "北台灣"
```

## 新增後的驗證

新增資料後，請檢查：

1. ✅ JSON 語法正確（可使用 JSON 驗證工具）
2. ✅ ID 唯一且連續
3. ✅ 學校名稱在 schools.json 中存在
4. ✅ 日期格式正確
5. ✅ 地區和類型在允許範圍內

## 自動化工具建議

未來可以開發自動化工具：

1. **新增課程時自動檢查學校**
2. **自動生成學校 ID**
3. **自動檢測重複課程**
4. **自動更新 schools.json**

## 維護事項

- **定期檢查**: 使用 `/school-sync` 檢查是否有遺漏的學校
- **更新學校資訊**: 學校變更名稱或地點時，同步更新所有相關課程
- **移除結束課程**: 定期清理已結束的課程資料

---

*本文檔最後更新：2026-06-10*
