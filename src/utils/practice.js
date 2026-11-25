import { getLocationOrder } from './location.js'

// 練習方案（practice.json）：以碼頭為單位，底下列出各家的練習與包船方案
const shortPrice = (value) => '$' + Number(value).toLocaleString('zh-TW')

// 價格文字：
// - priceText 優先（例如「會員免費／一般 $3,000」）
// - 包船（priceUnit: boat）：每船 $10,000（最多 4 人）
// - 其他：單價；沒有價格回傳空字串
export const formatPracticePrice = (offering) => {
  if (offering?.priceText) return offering.priceText
  if (offering?.price == null) return ''
  if (offering.priceUnit === 'boat') {
    return offering.capacity
      ? `每船 ${shortPrice(offering.price)}（最多 ${offering.capacity} 人）`
      : `每船 ${shortPrice(offering.price)}`
  }
  return shortPrice(offering.price)
}

// 包船方案換算成「每人約」，方便和課後練習的單價比較（需有價格與人數上限）
export const formatPerPerson = (offering) => {
  if (offering?.priceUnit !== 'boat' || offering.price == null || !offering.capacity) return ''
  return `滿 ${offering.capacity} 人每人約 ${shortPrice(Math.round(offering.price / offering.capacity))}`
}

// 依縣市（由北到南）→ 碼頭分組；沒有任何方案的碼頭不列出
export const groupPracticeByCity = (places, offerings) => {
  const byPlace = new Map()
  for (const o of offerings) {
    if (!byPlace.has(o.placeId)) byPlace.set(o.placeId, [])
    byPlace.get(o.placeId).push(o)
  }
  const cities = new Map()
  for (const place of places) {
    const list = byPlace.get(place.id)
    if (!list || !list.length) continue
    if (!cities.has(place.city)) cities.set(place.city, [])
    cities.get(place.city).push({ place, offerings: list })
  }
  return [...cities.entries()]
    .sort((a, b) => getLocationOrder(a[0]) - getLocationOrder(b[0]))
    .map(([city, items]) => ({ city, places: items }))
}
