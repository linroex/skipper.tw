import { parseLocalDate, formatDateRange } from './format.js'

// 活動類型標籤
export const ACTIVITY_TYPE_LABELS = {
  workshop: '體驗',
  voyage: '航行',
  race: '競賽',
  camp: '營隊',
  social: '聯誼',
  seminar: '講座'
}

export const getTypeLabel = (typeId) => ACTIVITY_TYPE_LABELS[typeId] || typeId || '活動'

// 參加條件（顯示用文字，例如「6 歲以上」「非學員需 ASA 101」「會員限定」）
export const getConditions = (activity) => activity?.conditions || []

// 主辦單位類型標籤
export const ORGANIZER_TYPE_LABELS = {
  school: '帆船學校',
  club: '遊艇俱樂部',
  community: '社團揪團'
}

export const getOrganizerTypeLabel = (type) => ORGANIZER_TYPE_LABELS[type] || ''

// 取得排程型態：fixed（固定日期）/ recurring（多梯次）/ flexible（揪團成行）
export const getScheduleType = (activity) => activity?.schedule?.type || 'fixed'

export const isFlexible = (activity) => getScheduleType(activity) === 'flexible'

const toDate = (value) => {
  const d = parseLocalDate(value)
  if (d) d.setHours(0, 0, 0, 0)
  return d
}

const sortedSessionDates = (sessions = []) =>
  sessions.map(toDate).filter(Boolean).sort((a, b) => a - b)

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// 用於排序的起始日期
export const getActivityStartDate = (activity) => {
  const schedule = activity?.schedule || {}
  switch (getScheduleType(activity)) {
    case 'recurring': {
      const dates = sortedSessionDates(schedule.sessions)
      return dates[0] || null
    }
    case 'flexible':
      return toDate(schedule.windowStart)
    default:
      return toDate(schedule.startDate)
  }
}

// 用於判斷是否結束的終止日期
export const getActivityEndDate = (activity) => {
  const schedule = activity?.schedule || {}
  switch (getScheduleType(activity)) {
    case 'recurring': {
      const dates = sortedSessionDates(schedule.sessions)
      return dates[dates.length - 1] || null
    }
    case 'flexible':
      return toDate(schedule.windowEnd)
    default:
      return toDate(schedule.endDate || schedule.startDate)
  }
}

// 是否仍可參加（揪團活動只要在開放區間內就算進行中）
export const isUpcomingActivity = (activity) => {
  const end = getActivityEndDate(activity)
  if (!end) return false
  return end >= today()
}

export const isPastActivity = (activity) => {
  const end = getActivityEndDate(activity)
  if (!end) return false
  return end < today()
}

const MD = (date) => `${date.getMonth() + 1}/${date.getDate()}`

// 多梯次活動：尚未過期的梯次日期（由近到遠）
export const getUpcomingSessions = (activity) => {
  const dates = sortedSessionDates(activity?.schedule?.sessions)
  return dates.filter(d => d >= today())
}

// 用於「近期出航」排序的下一個日期
export const getNextDate = (activity) => {
  if (getScheduleType(activity) === 'recurring') {
    return getUpcomingSessions(activity)[0] || getActivityStartDate(activity)
  }
  return getActivityStartDate(activity)
}

// 清單「日期欄」的精簡文字：7/18、8/8–9、9/18–21；揪團活動回傳「揪團」
export const formatWhenShort = (activity) => {
  const schedule = activity?.schedule || {}
  switch (getScheduleType(activity)) {
    case 'flexible':
      return '揪團'
    case 'recurring': {
      const next = getUpcomingSessions(activity)[0]
      return next ? MD(next) : '多梯次'
    }
    default: {
      const start = toDate(schedule.startDate)
      const end = toDate(schedule.endDate || schedule.startDate)
      if (!start) return '-'
      if (!end || start.getTime() === end.getTime()) return MD(start)
      if (start.getMonth() === end.getMonth()) return `${MD(start)}–${end.getDate()}`
      return `${MD(start)}–${MD(end)}`
    }
  }
}

// 清單副標的補充資訊：梯次、成行人數、開團月份、時長、備註
export const getSubExtras = (activity) => {
  const schedule = activity?.schedule || {}
  const extras = []

  if (getScheduleType(activity) === 'recurring') {
    const rest = getUpcomingSessions(activity).slice(1)
    if (rest.length) extras.push(`另有 ${rest.map(MD).join('、')} 梯次`)
  }

  if (getScheduleType(activity) === 'flexible') {
    if (schedule.minParticipants) extras.push(`滿 ${schedule.minParticipants} 位成行`)
    const start = toDate(schedule.windowStart)
    const end = toDate(schedule.windowEnd)
    if (start && end) {
      const fullYear = start.getMonth() === 0 && end.getMonth() === 11 &&
        start.getFullYear() === end.getFullYear()
      if (!fullYear) extras.push(`${start.getMonth() + 1}–${end.getMonth() + 1} 月`)
    }
  }

  if (activity?.duration) extras.push(activity.duration)
  if (schedule.note) extras.push(schedule.note)
  return extras
}

// 排程的完整顯示文字（首頁表格等處使用）
export const formatSchedule = (activity) => {
  const schedule = activity?.schedule || {}
  if (getScheduleType(activity) === 'flexible') return '揪團成行'
  if (getScheduleType(activity) === 'recurring') {
    const dates = sortedSessionDates(schedule.sessions)
    if (dates.length === 0) return '多梯次'
    return dates.map(MD).join('、')
  }
  return formatDateRange(schedule.startDate, schedule.endDate)
}

const shortPrice = (value) => '$' + Number(value).toLocaleString('zh-TW')

// 價格欄：主價格與附註（皆可能為 null，沒有就不顯示）
export const getPriceParts = (activity) => {
  const { price, memberPrice, priceText } = activity || {}
  if (priceText) {
    return { main: priceText, note: null }
  }
  if (price != null) {
    return { main: shortPrice(price), note: memberPrice != null ? `學員 ${shortPrice(memberPrice)}` : null }
  }
  if (memberPrice != null) {
    return { main: `學員 ${shortPrice(memberPrice)}`, note: null }
  }
  return { main: null, note: null }
}
