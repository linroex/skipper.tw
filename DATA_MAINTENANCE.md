# 資料維護指南

本文檔說明如何維護課程和活動資料。

## 快速開始

### 使用專案管理腳本

```bash
# 檢查資料完整性
./skipper.sh check

# 查看學校統計
./skipper.sh schools

# 查看課程統計
./skipper.sh courses

# 啟動開發伺服器
./skipper.sh dev
```

## 新增課程或活動

### 步驟 1：檢查學校是否存在

新增課程或活動前，先確認學校是否已定義：

```bash
# 執行完整檢查
./skipper.sh check
```

如果發現「未定義的學校」，需要先新增到 `public/data/schools.json`。

### 步驟 2：新增學校資料（如需要）

如果學校尚未定義，手動新增到 `public/data/schools.json`：

```json
{
  "id": "學校識別碼",
  "name": "學校全名（必須與課程中的 unit 完全相同）",
  "shortName": "簡短名稱",
  "description": "學校描述",
  "certs": ["認證類型"],
  "locations": ["地點"]
}
```

**學校 ID 生成規則**：
- 將學校名稱轉為小寫
- 移除所有空格和特殊字元
- 範例：「TMS 台灣海洋帆船學校」→ `tmstaiwanseasailing`

### 步驟 3：新增課程資料

編輯 `public/data/courses.json`，在 `courses` 陣列中新增一筆：

```json
{
  "id": 28,  // 使用下一個可用的 ID
  "title": "ASA 101 基礎重型帆船課程",
  "organization": "ASA",
  "level": "beginner",  // 可選：beginner/intermediate/advanced
  "region": "北台灣",  // 必須：北台灣/中台灣/南台灣/東台灣
  "startDate": "2026-08-15",
  "endDate": "2026-08-17",
  "location": "台北",
  "unit": "學校全名",  // 必須與 schools.json 中的 name 完全匹配
  "price": 0,
  "contact": "聯絡方式",
  "description": "課程描述",
  "url": "https://example.com"
}
```

### 步驟 4：驗證資料

新增後執行檢查：

```bash
./skipper.sh check
```

確保：
- ✅ 沒有重複課程
- ✅ 所有學校都已定義
- ✅ 日期格式正確（YYYY-MM-DD）
- ✅ 地區在允許範圍內

## 資料檢查

### 檢查重複課程

檢查是否有相同的課程（相同單位、名稱、日期）：

```bash
# 使用檢查腳本
python3 scripts/check-data.py
```

### 檢查遺漏的學校

找出課程中但 schools.json 中沒有定義的學校：

```bash
python3 scripts/check-data.py
```

會顯示：
- 哪些學校未定義
- 建議新增的資料格式

### 檢查格式錯誤

檢查日期格式、地區、類型等：

```bash
python3 scripts/check-data.py
```

## 常見問題

### Q: 如何確定 ID 不重複？

A: 查看 JSON 檔案中最大的 ID，然後 +1

```bash
# 查看最大課程 ID
python3 -c "import json; print(max(c['id'] for c in json.load(open('public/data/courses.json'))['courses']))"
```

### Q: 學校名稱不匹配怎麼辦？

A: 確保 `courses.json` 中的 `unit` 欄位與 `schools.json` 中的 `name` 完全相同

錯誤範例：
```json
// courses.json
"unit": "TMS 海洋學校"

// schools.json
"name": "TMS 台灣海洋帆船學校"  // ❌ 不匹配
```

正確範例：
```json
// courses.json
"unit": "TMS 台灣海洋帆船學校"

// schools.json
"name": "TMS 台灣海洋帆船學校"  // ✅ 完全相同
```

### Q: 日期格式錯誤？

A: 必須使用 `YYYY-MM-DD` 格式

錯誤：`"2026/08/15"` 或 `"2026-8-15"`
正確：`"2026-08-15"`

### Q: 地區不在允許範圍？

A: 必須使用以下四個之一：
- 北台灣
- 中台灣
- 南台灣
- 東台灣

## 維護清單

新增課程或活動後，請檢查：

- [ ] ID 唯一且連續
- [ ] 學校名稱在 schools.json 中存在且完全匹配
- [ ] 日期格式正確
- [ ] 地區在允許範圍內
- [ ] 沒有重複的課程
- [ ] JSON 語法正確

## 自動化工具

專案已提供以下工具：

1. **check-data.py** - 檢查重複課程、遺漏學校、格式錯誤
2. **skipper.sh** - 專案管理腳本（學校統計、課程統計、檢查）

未來可考慮開發：
- 自動新增學校到 schools.json
- 自動檢查重複課程
- 自動更新 schools.json

## 參考文件

- [COURSE_DATA_GUIDE.md](./docs/COURSE_DATA_GUIDE.md) - 詳細格式指南
- [AGENTS.md](./AGENTS.md) - 專案結構說明

---

*最後更新：2026-06-10*
