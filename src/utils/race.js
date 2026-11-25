import { parseLocalDate } from './format.js'

// 比賽（races.json）的日期與分組邏輯
// 結構：比賽 race → 各年度場次 editions → 各校報名資訊 entries

const toDate = (value) => {
  const d = parseLocalDate(value)
  if (d) d.setHours(0, 0, 0, 0)
  return d
}

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const MD = (date) => `${date.getMonth() + 1}/${date.getDate()}`

export const editionStart = (edition) => toDate(edition?.startDate)
export const editionEnd = (edition) => toDate(edition?.endDate || edition?.startDate)
export const editionYear = (edition) => editionStart(edition)?.getFullYear() ?? null

export const isUpcomingEdition = (edition) => {
  const end = editionEnd(edition)
  return !!end && end >= today()
}

// 場次日期：2/28、6/27–6/30、6/28–7/2
export const formatEditionDate = (edition) => {
  const start = editionStart(edition)
  const end = editionEnd(edition)
  if (!start) return '日期待定'
  if (!end || start.getTime() === end.getTime()) return MD(start)
  if (start.getMonth() === end.getMonth()) return `${MD(start)}–${end.getDate()}`
  return `${MD(start)}–${MD(end)}`
}

export const sortEditions = (race) =>
  [...(race?.editions || [])].sort((a, b) => (editionStart(a) ?? 0) - (editionStart(b) ?? 0))

// 依年份分組（新到舊；同年內由早到晚）
export const groupEditionsByYear = (race) => {
  const byYear = new Map()
  for (const edition of sortEditions(race)) {
    const year = editionYear(edition)
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year).push(edition)
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, editions]) => ({ year, editions }))
}

// 日期狀態：tentative＝還沒有官方公告（預計）、planned＝年初行事曆預定（實際可能略有不同）
export const DATE_STATUS_LABELS = { tentative: '預計', planned: '預定日期' }

// 該場次所有出現過的學校（去重）
export const editionUnits = (edition) => [...new Set((edition?.entries || []).map(e => e.unit).filter(Boolean))]

// 所有有場次的年份（新到舊）
export const getRaceYears = (races) => {
  const years = new Set()
  for (const race of races) for (const e of race.editions || []) {
    const y = editionYear(e)
    if (y) years.add(y)
  }
  return [...years].sort((a, b) => b - a)
}

// 某一年的所有場次（攤平、依日期排序），每筆附上所屬月份
export const getYearEvents = (races, year) =>
  races
    .flatMap(race =>
      (race.editions || [])
        .filter(e => editionYear(e) === year)
        .map(edition => ({ race, edition, month: editionStart(edition).getMonth() + 1 }))
    )
    .sort((a, b) => editionStart(a.edition) - editionStart(b.edition))

// 今年還沒有場次、但前一年有舉辦的比賽：回傳去年的場次，讓大家參考時間提早準備
export const getMissingThisYear = (races, year) =>
  races
    .filter(race => !(race.editions || []).some(e => editionYear(e) === year))
    .map(race => {
      const last = sortEditions(race).filter(e => editionYear(e) === year - 1).pop()
      return last ? { race, edition: last } : null
    })
    .filter(Boolean)
    .sort((a, b) => editionStart(a.edition) - editionStart(b.edition))

// 某學校參加過哪些比賽（有出現在 entries）
export const getRaceParticipation = (races, unitName) =>
  races
    .map(race => ({
      race,
      editions: sortEditions(race).filter(e => (e.entries || []).some(x => x.unit === unitName))
    }))
    .filter(item => item.editions.length > 0)
