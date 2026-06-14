// 地區排序規則（由北到南）
export const locationOrder = {
  // 北台灣
  '基隆': 1,
  '台北': 2,
  '新北': 3,
  '八里': 4,
  '桃園': 5,
  // 東台灣（因為東部地形特殊，放北台灣之後）
  '花蓮': 5,
  '宜蘭': 6,
  // 中台灣
  '新竹': 7,
  '苗栗': 8,
  '台中': 9,
  '彰化': 10,
  '南投': 11,
  // 南台灣
  '雲林': 12,
  '嘉義': 13,
  '台南': 14,
  '高雄': 15,
  '屏東': 16,
  // 其他
  '澎湖': 17,
  '金門': 18,
  '馬祖': 19
}

// 獲取地區順序數值，未定義的排在最後
export function getLocationOrder(location) {
  return locationOrder[location] || 999
}

// 地區列表（按由北到南排序）
export const regionOrder = [
  '北台灣',
  '東台灣',
  '中台灣',
  '南台灣'
]

// 獲取地區順序數值
export function getRegionOrder(region) {
  const index = regionOrder.indexOf(region)
  return index === -1 ? 999 : index
}
