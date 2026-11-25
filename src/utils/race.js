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

// 列表頁用的摘要：
// group = upcoming（有未結束的場次）／thisYear（今年已辦完）／earlier（今年還沒有場次）
export const summarizeRace = (race) => {
  const editions = sortEditions(race)
  const nowYear = today().getFullYear()
  const upcoming = editions.filter(isUpcomingEdition)
  const latest = editions[editions.length - 1] || null
  const next = upcoming[0] || null

  let group = 'earlier'
  if (next) group = 'upcoming'
  else if (latest && editionYear(latest) === nowYear) group = 'thisYear'

  // 沒有未結束場次時，用最近一次的月份當作「預計時間」
  const refEdition = next || latest
  const refStart = editionStart(refEdition)
  const sortMonth = refStart ? refStart.getMonth() * 100 + refStart.getDate() : 9999

  // 「2026：2/28・5/2・12/12　2025：10/18」
  const years = groupEditionsByYear(race)
    .slice(0, 2)
    .map(({ year, editions: list }) => `${year}：${list.map(e => formatEditionDate(e) + (e.dateStatus === 'tentative' ? '（預計）' : '')).join('・')}`)
    .join('　')

  const unitSource = next || latest
  const unitCount = editionUnits(unitSource).length

  let when = ''
  if (next) when = formatEditionDate(next)
  else if (refStart) when = `${refStart.getMonth() + 1} 月`

  return {
    race, group, next, latest, when, years, unitCount,
    unitLabel: next ? '可報名' : '參加',
    tentative: !!next && next.dateStatus === 'tentative',
    sortMonth,
    sortNext: editionStart(next) ?? 0
  }
}

// 某學校參加過哪些比賽（有出現在 entries）
export const getRaceParticipation = (races, unitName) =>
  races
    .map(race => ({
      race,
      editions: sortEditions(race).filter(e => (e.entries || []).some(x => x.unit === unitName))
    }))
    .filter(item => item.editions.length > 0)
