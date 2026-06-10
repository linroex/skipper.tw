export const parseLocalDate = (date) => {
  if (!date) return null
  const [year, month, day] = String(date).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export const formatDate = (date) => {
  const d = parseLocalDate(date)
  if (!d) return '-'
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export const formatDateRange = (start, end) => {
  const startDate = parseLocalDate(start)
  const endDate = parseLocalDate(end || start)
  if (!startDate || !endDate) return '-'

  const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`
  const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const startDay = weekDays[startDate.getDay()]
  const endDay = weekDays[endDate.getDay()]

  if (start === end || !end) return `${startStr} (${startDay})`
  return `${startStr}-${endStr} (${startDay}-${endDay})`
}

export const formatItemDate = (item) => {
  if (item?.dateText) return item.dateText
  return formatDateRange(item?.startDate || item?.date, item?.endDate || item?.date)
}

export const formatPrice = (price) => {
  if (price === null || price === undefined || price === 0 || price === '') return '需洽詢'
  return 'NT$' + Number(price).toLocaleString('zh-TW')
}
