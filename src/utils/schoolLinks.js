// 單位連結：schools.json 的 links 物件 → 依固定順序排列的清單
// links 可含：website（官網）、facebook、instagram、line（皆為完整網址，有才顯示）
const LINK_TYPES = [
  { key: 'website', label: '官方網站' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'line', label: 'LINE' }
]

export const getSchoolLinks = (schoolInfo) =>
  LINK_TYPES
    .filter(({ key }) => schoolInfo?.links?.[key])
    .map(({ key, label }) => ({ key, label, url: schoolInfo.links[key] }))
