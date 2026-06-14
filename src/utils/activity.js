import { parseLocalDate, formatDateRange, formatPrice } from './format.js'

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

// 參加對象標籤
export const AUDIENCE_LABELS = {
  public: '對外開放',
  members: '學員專屬'
}

export const getAudienceLabel = (audience) => AUDIENCE_LABELS[audience] || AUDIENCE_LABELS.public

export const isMembersOnly = (activity) => activity?.audience === 'members'

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

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
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

const MONTH_FMT = (date) => `${date.getMonth() + 1}/${date.getDate()}`

// 排程的顯示文字
export const formatSchedule = (activity) => {
  const schedule = activity?.schedule || {}
  const note = schedule.note ? `｜${schedule.note}` : ''

  if (getScheduleType(activity) === 'flexible') {
    const start = parseLocalDate(schedule.windowStart)
    const end = parseLocalDate(schedule.windowEnd)
    let window = '全年開團'
    if (start && end) {
      const sameYear = start.getFullYear() === end.getFullYear()
      const isFullYear = sameYear && start.getMonth() === 0 && end.getMonth() === 11
      window = isFullYear ? '全年開團' : `${start.getMonth() + 1}–${end.getMonth() + 1} 月`
    }
    const min = schedule.minParticipants ? `滿 ${schedule.minParticipants} 位成行` : '揪團成行'
    return `${window}・${min}${note}`
  }

  if (getScheduleType(activity) === 'recurring') {
    const dates = sortedSessionDates(schedule.sessions)
    if (dates.length === 0) return `多梯次${note}`
    const labels = dates.map(MONTH_FMT)
    const shown = labels.length > 4 ? `${labels.slice(0, 4).join('、')}…` : labels.join('、')
    return `${labels.length} 梯次：${shown}${note}`
  }

  return `${formatDateRange(schedule.startDate, schedule.endDate)}${note}`
}

// 價格顯示：優先 priceText；有學員優惠價則並列；否則一般價格
export const formatActivityPrice = (activity) => {
  if (activity?.priceText) return activity.priceText
  const { price, memberPrice } = activity || {}
  if (memberPrice != null && price != null) {
    return `${formatPrice(price)}（學員 ${formatPrice(memberPrice)}）`
  }
  if (memberPrice != null) return `學員 ${formatPrice(memberPrice)}`
  return formatPrice(price)
}
