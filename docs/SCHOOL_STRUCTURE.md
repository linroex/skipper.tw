# 學校結構說明

本文件說明學校結構的修改，包含新增的「英文簡稱」和「短名字」兩個欄位。

## 新增欄位

### 1. 英文簡稱 (id)
- **用途**: 用於網址路由
- **格式**: 小寫英文字母或拼音，例如 `tms`、`chenguang`、`haiyang`
- **範例**: `/schools/tms` 對應 TMS 台灣海洋帆船學校

### 2. 短名字 (shortName)
- **用途**: 用於顯示，當名稱太長時使用
- **格式**: 中文或英文縮寫，例如 `TMS`、`晨光海洋`
- **範例**: 在學校卡片和詳情頁面顯示

## 資料結構

### schools.json

```json
{
  "schools": [
    {
      "id": "tms",
      "name": "TMS 台灣海洋帆船學校",
      "shortName": "TMS",
      "description": "專業帆船學校，提供 ASA 全系列認證課程",
      "certs": ["ASA"],
      "locations": ["高雄"]
    }
  ]
}
```

**欄位說明**:
- `id`: 英文簡稱（唯一識別碼）
- `name`: 完整名稱
- `shortName`: 短名字
- `description`: 學校描述
- `certs`: 認證組織列表
- `locations`: 服務地區列表

## 路由修改

### 路由規則
- 學校列表：`/schools`
- 學校詳情：`/schools/:id`（使用英文簡稱）

### 範例
- `http://localhost:5173/schools/tms` - TMS 台灣海洋帆船學校詳情
- `http://localhost:5173/schools/晨光海洋` - 晨光海洋 ASA 帆船學校詳情

## 修改檔案清單

1. `public/data/schools.json` - 新增學校資料檔案
2. `src/utils/api.js` - 新增 `fetchSchools()` 函數
3. `src/views/Schools.vue` - 更新學校列表，顯示短名字
4. `src/views/School.vue` - 更新學校詳情，顯示短名字
5. `src/router/index.js` - 修改路由參數為 `:id`

## 使用方式

### 新增學校
1. 編輯 `public/data/schools.json`
2. 為每所學校設定 `id`、`name`、`shortName`
3. 確保 `id` 唯一且適合用於網址

### 顯示範例

#### 學校卡片
```
┌─────────────────────────┐
│ TMS 台灣海洋帆船學校 [TMS] │  ← 短名字顯示在右側
│ 12 課程  5 活動          │
│ 專業帆船學校...          │
│ [ASA]                    │
└─────────────────────────┘
```

#### 學校詳情
```
TMS 台灣海洋帆船學校 [TMS]  ← 標題下方顯示短名字
```

## 注意事項

1. **id 欄位必須唯一**: 用於網址和資料庫查詢
2. **短名字可選**: 如果不需要，可以不設定
3. **名稱一致性**: `name` 必須與課程/活動的 `unit` 欄位一致
4. **網址處理**: 學校詳情頁面會自動將 id 編碼為 URL
