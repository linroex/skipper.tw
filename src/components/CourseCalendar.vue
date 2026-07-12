<template>
  <div class="bg-surface rounded-lg border border-line overflow-hidden">
    <!-- Header with week navigation -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-line">
      <button
        @click="prevWeek"
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-line transition text-ink-soft text-xl font-light"
        title="上一個月"
      >
        ‹
      </button>
      <h2 class="text-base font-bold text-ink">
        {{ dateRangeText }}
      </h2>
      <button
        @click="nextWeek"
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-line transition text-ink-soft text-xl font-light"
        title="下一個月"
      >
        ›
      </button>
    </div>

    <!-- Day of week headers -->
    <div class="grid grid-cols-7 border-b border-line">
      <div
        v-for="(day, i) in ['一', '二', '三', '四', '五', '六', '日']"
        :key="day"
        :class="[
          'py-2 text-center text-xs font-medium',
          i === 6 ? 'text-red-400' : i === 5 ? 'text-blue-400' : 'text-ink-faint'
        ]"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="border-l border-t">
      <div
        v-for="(week, weekIndex) in calendarWeeksWithCourses"
        :key="weekIndex"
        class="relative grid grid-cols-7"
        :style="getWeekStyle(week)"
        :class="week.isOutsideMainView ? 'bg-paper/60' : ''"
      >
        <div
          v-for="cell in week.cells"
          :key="`${weekIndex}-${cell.dateKey}`"
          :class="[
            'border-r border-b p-1 relative z-10',
            cell.isCurrentMonth ? '' : 'bg-paper/70',
            cell.isMonthBoundary ? 'border-l-4 border-l-gray-400' : ''
          ]"
        >
          <div v-if="cell.date" class="flex justify-center">
            <span
              :class="[
                'min-w-6 h-6 px-1 flex items-center justify-center text-xs font-medium rounded-full',
                isToday(cell.date)
                  ? 'bg-primary text-paper'
                  : cell.isCurrentMonth
                  ? 'text-ink-soft'
                  : 'text-ink-faint'
              ]"
            >
              {{ getCellDateLabel(cell) }}
            </span>
          </div>
        </div>

        <button
          v-for="segment in week.segments"
          :key="segment.key"
          type="button"
          @click="openCourse(segment.course)"
          :class="[
            'absolute z-20 h-8 md:h-9 rounded px-1.5 text-[11px] md:text-xs leading-3 md:leading-4 cursor-pointer text-left shadow-sm hover:brightness-95 transition',
            segment.colorClass || getCourseColor(segment.course),
            isPastCourse(segment.course) ? 'opacity-60' : ''
          ]"
          :style="getSegmentStyle(segment)"
          :title="fullCourseInfo(segment.course)"
        >
          <div class="flex flex-col gap-0.5">
            <span class="font-bold truncate">{{ shortTitle(segment.course) }}</span>
            <span class="truncate">{{ getSchoolShortName(segment.course.unit) }} · {{ segment.course.location }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="hasNoCoursesInView" class="py-8 text-center text-sm text-ink-faint">
      此範圍內沒有符合條件的課程
    </div>

    <!-- Course detail modal -->
    <Teleport to="body">
      <div
        v-if="selectedCourse"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="selectedCourse = null"
      >
        <div class="bg-surface rounded-xl shadow-xl max-w-sm w-full p-5">
          <div class="flex items-start justify-between mb-3">
            <span :class="['px-2 py-0.5 text-xs rounded font-medium', getCourseColor(selectedCourse)]">
              {{ selectedCourse.title }}
            </span>
            <button
              @click="selectedCourse = null"
              class="text-ink-faint hover:text-ink-soft leading-none text-lg"
            >
              ✕
            </button>
          </div>
          <h3 class="text-base font-bold text-ink mb-3 leading-snug">
            {{ selectedCourse.title }}
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex gap-3">
              <span class="text-ink-faint w-12 shrink-0">日期</span>
              <span class="text-ink-soft">{{ formatItemDate(selectedCourse) }}</span>
            </div>
            <div class="flex gap-3">
              <span class="text-ink-faint w-12 shrink-0">{{ selectedCourse.isActivity ? '主辦' : '學校' }}</span>
              <span class="text-ink-soft">{{ getSchoolName(selectedCourse.unit) }}</span>
            </div>
            <div class="flex gap-3">
              <span class="text-ink-faint w-12 shrink-0">地點</span>
              <span class="text-ink-soft">{{ selectedCourse.location }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-line">
            <a
              v-if="selectedCourse.isActivity && selectedCourse.url"
              :href="selectedCourse.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block bg-primary text-paper px-4 py-2 rounded-lg text-sm hover:bg-secondary transition"
            >
              前往活動頁面
            </a>
            <router-link
              v-else
              :to="getSchoolRoute(selectedCourse.unit)"
              class="inline-block bg-primary text-paper px-4 py-2 rounded-lg text-sm hover:bg-secondary transition"
              @click="selectedCourse = null"
            >
              前往學校
            </router-link>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseLocalDate, formatItemDate } from '../utils/format.js'

const props = defineProps({
  items: { type: Array, required: true },
  getSchoolName: { type: Function, required: true },
  getSchoolRoute: { type: Function, required: true }
})

const today = new Date()
today.setHours(0, 0, 0, 0)
const dayMs = 24 * 60 * 60 * 1000

// 獲取某日期的週一
const getMondayOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

// 目前焦點日期；左右切換仍以週為單位
const focusedDate = ref(new Date(today))
const selectedCourse = ref(null)

const focusedMonthStart = computed(() => new Date(focusedDate.value.getFullYear(), focusedDate.value.getMonth(), 1))
const focusedMonthEnd = computed(() => new Date(focusedDate.value.getFullYear(), focusedDate.value.getMonth() + 1, 0))

const isPastRange = (start, end) => end < today

const monthCalendarStart = computed(() => getMondayOfWeek(focusedMonthStart.value))
const monthCalendarEnd = computed(() => {
  const end = getMondayOfWeek(focusedMonthEnd.value)
  end.setDate(end.getDate() + 6)
  return end
})

const shouldShowLeadingWeek = computed(() => {
  const leadingStart = new Date(monthCalendarStart.value)
  leadingStart.setDate(leadingStart.getDate() - 7)
  const leadingEnd = new Date(monthCalendarStart.value)
  leadingEnd.setDate(leadingEnd.getDate() - 1)
  return !isPastRange(leadingStart, leadingEnd)
})

const shouldShowTrailingWeek = computed(() => {
  const trailingStart = new Date(monthCalendarEnd.value)
  trailingStart.setDate(trailingStart.getDate() + 1)
  const trailingEnd = new Date(monthCalendarEnd.value)
  trailingEnd.setDate(trailingEnd.getDate() + 7)
  return !isPastRange(trailingStart, trailingEnd)
})

// 顯示範圍：當月完整月曆週 + 尚未完全過去的前後輔助週
const currentWeekStart = computed(() => {
  const start = new Date(monthCalendarStart.value)
  if (shouldShowLeadingWeek.value) start.setDate(start.getDate() - 7)
  return start
})

const displayEndDate = computed(() => {
  const end = new Date(monthCalendarEnd.value)
  if (shouldShowTrailingWeek.value) end.setDate(end.getDate() + 7)
  return end
})

const visibleWeeksCount = computed(() => Math.floor((displayEndDate.value - currentWeekStart.value) / (7 * dayMs)) + 1)

// 導航：上一個月
const prevWeek = () => {
  focusedDate.value = new Date(
    focusedDate.value.getFullYear(),
    focusedDate.value.getMonth() - 1,
    1
  )
}

// 導航：下一個月
const nextWeek = () => {
  focusedDate.value = new Date(
    focusedDate.value.getFullYear(),
    focusedDate.value.getMonth() + 1,
    1
  )
}

// 跳到今天
const jumpToToday = () => {
  focusedDate.value = new Date()
}

// 日期範圍文字（標題）
const dateRangeText = computed(() => {
  return `${focusedDate.value.getFullYear()}年 ${focusedDate.value.getMonth() + 1} 月`
})

// 判斷是否是今天
const isToday = (date) =>
  date.getDate() === today.getDate() &&
  date.getMonth() === today.getMonth() &&
  date.getFullYear() === today.getFullYear()

// 判斷是否為焦點月份（用於淡色處理）
const isCurrentMonth = (date) => {
  return date.getMonth() === focusedDate.value.getMonth() &&
    date.getFullYear() === focusedDate.value.getFullYear()
}

// 獲取主要視圖的起始日期（焦點月份第一天）
const getMainViewStart = () => new Date(focusedMonthStart.value)

// 獲取主要視圖的結束日期（焦點月份最後一天）
const getMainViewEnd = () => new Date(focusedMonthEnd.value)

const openCourse = (course) => { selectedCourse.value = course }

const isPastCourse = (course) => {
  const endDate = parseLocalDate(course.endDate || course.startDate)
  if (!endDate) return false
  endDate.setHours(0, 0, 0, 0)
  return endDate < today
}

// 高對比度配色，順序刻意錯開色相，避免相鄰課程看起來太像
const courseColors = [
  'bg-red-500 text-paper hover:bg-red-600',
  'bg-blue-500 text-paper hover:bg-blue-600',
  'bg-green-500 text-paper hover:bg-green-600',
  'bg-purple-500 text-paper hover:bg-purple-600',
  'bg-orange-500 text-paper hover:bg-orange-600',
  'bg-teal-500 text-paper hover:bg-teal-600',
  'bg-pink-500 text-paper hover:bg-pink-600',
  'bg-indigo-500 text-paper hover:bg-indigo-600',
  'bg-yellow-400 text-yellow-900 hover:bg-yellow-500',
  'bg-cyan-500 text-paper hover:bg-cyan-600',
  'bg-rose-500 text-paper hover:bg-rose-600',
  'bg-lime-500 text-paper hover:bg-lime-600',
  'bg-violet-500 text-paper hover:bg-violet-600',
  'bg-amber-500 text-paper hover:bg-amber-600',
  'bg-sky-500 text-paper hover:bg-sky-600',
  'bg-fuchsia-500 text-paper hover:bg-fuchsia-600',
  'bg-gray-500 text-paper hover:bg-gray-600',
]

const courseColorIndexCache = new Map()

// 同一單位的同名項目（例如多梯次活動）共用同一顏色
const getCourseColorKey = (course) => `${course.unit}|${course.title}`

const getCourseColorIndex = (course) => {
  const courseKey = getCourseColorKey(course)
  if (courseColorIndexCache.has(courseKey)) return courseColorIndexCache.get(courseKey)

  let hash = 0
  for (let i = 0; i < courseKey.length; i++) {
    hash = ((hash << 5) - hash) + courseKey.charCodeAt(i)
    hash = hash & hash
  }

  const colorIndex = Math.abs(hash) % courseColors.length
  courseColorIndexCache.set(courseKey, colorIndex)
  return colorIndex
}

const getCourseColor = (course) => courseColors[getCourseColorIndex(course)]

const rangesOverlap = (aStart, aSpan, bStart, bSpan) => {
  return aStart < bStart + bSpan && aStart + aSpan > bStart
}

const chooseSegmentColorIndex = (course, overlappingSegments) => {
  const baseIndex = getCourseColorIndex(course)
  const usedIndexes = new Set(overlappingSegments.map(segment => segment.colorIndex).filter(index => index !== undefined))

  if (!usedIndexes.has(baseIndex)) return baseIndex

  for (let offset = 1; offset < courseColors.length; offset++) {
    const candidateIndex = (baseIndex + offset) % courseColors.length
    if (!usedIndexes.has(candidateIndex)) return candidateIndex
  }

  return baseIndex
}

const shortTitle = (course) => {
  const match = course.title?.match(/ASA\s*\d{2,3}|IYT\s*\d{2,3}/i)
  if (match) {
    return match[0].replace(/\s+/, ' ').toUpperCase()
  }
  return course.title?.substring(0, 5) || ''
}

const getSchoolShortName = (unit) => {
  if (!unit) return ''
  const match = unit.match(/^[A-Z]+/)
  return match ? match[0] : unit.substring(0, 4)
}

const fullCourseInfo = (course) => {
  const schoolShort = getSchoolShortName(course.unit)
  return `${course.title}\n學校：${schoolShort}\n地點：${course.location}\n日期：${formatItemDate(course)}`
}

const getMondayBasedDayIndex = (date) => (date.getDay() + 6) % 7
const daysBetweenInclusive = (start, end) => Math.floor((end - start) / dayMs) + 1

const toDateKey = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const getCellDateLabel = (cell) => {
  if (cell.showMonthDay || cell.isMonthBoundary) {
    return `${cell.date.getMonth() + 1}/${cell.date.getDate()}`
  }
  return cell.date.getDate()
}

const getCourseDates = (course, currentYear) => {
  const startDate = parseLocalDate(course.startDate)
  const endDate = parseLocalDate(course.endDate || course.startDate)
  if (!startDate || !endDate) return []

  if (course.dateText) {
    const dateMatches = course.dateText.match(/\d+\/\d+/g)
    if (dateMatches) {
      const year = currentYear || new Date().getFullYear()
      return dateMatches.map(d => {
        const [month, day] = d.split('/').map(Number)
        return new Date(year, month - 1, day)
      })
    }
  }

  const dates = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

const mergeConsecutiveDates = (dates) => {
  const sorted = [...dates]
    .sort((a, b) => a - b)
    .filter((date, index, array) => index === 0 || toDateKey(date) !== toDateKey(array[index - 1]))

  if (sorted.length === 0) return []

  const ranges = []
  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const date = sorted[i]
    const nextExpected = new Date(end)
    nextExpected.setDate(nextExpected.getDate() + 1)

    if (toDateKey(date) === toDateKey(nextExpected)) {
      end = date
    } else {
      ranges.push({ start, end })
      start = date
      end = date
    }
  }

  ranges.push({ start, end })
  return ranges
}

// 獲取可見範圍的起始和結束日期
const viewStartDate = computed(() => new Date(currentWeekStart.value))
const viewEndDate = computed(() => new Date(displayEndDate.value))

const courseDateRanges = computed(() => {
  const currentYear = focusedDate.value.getFullYear()
  return props.items.flatMap(course => {
    const dates = getCourseDates(course, currentYear)
    const datesInView = dates.filter(date => date >= viewStartDate.value && date <= viewEndDate.value)
    return mergeConsecutiveDates(datesInView).map((range, rangeIndex) => ({
      course,
      range,
      key: `${course.unit}|${course.title}|${course.startDate}|${course.endDate}|${rangeIndex}`
    }))
  })
})



// 將課程分配到各週
const assignCoursesToWeeks = () => {
  // 先建立週的基礎結構
  const weeks = []
  const weekStart = new Date(currentWeekStart.value)
  
  for (let w = 0; w < visibleWeeksCount.value; w++) {
    const weekStartsOn = new Date(weekStart)
    weekStartsOn.setDate(weekStartsOn.getDate() + w * 7)
    
    const cells = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStartsOn)
      date.setDate(date.getDate() + d)
      const previousDate = new Date(date)
      previousDate.setDate(previousDate.getDate() - 1)
      cells.push({
        date,
        dateKey: toDateKey(date),
        isCurrentMonth: isCurrentMonth(date),
        isMonthBoundary: d > 0 && date.getMonth() !== previousDate.getMonth(),
        isFirstDayOfWeek: d === 0
      })
    }

    if (w === 0 && cells[0]) {
      cells[0].showMonthDay = true
    }
    
    // 判斷這週是否在焦點月份外（前導週或後導週）
    const weekEnd = new Date(weekStartsOn)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    const isOutsideMainView = weekEnd < focusedMonthStart.value || weekStartsOn > focusedMonthEnd.value
    
    weeks.push({
      cells,
      segments: [],
      isOutsideMainView,
      weekStart: new Date(weekStartsOn)
    })
  }
  
  courseDateRanges.value.forEach(({ course, range, key }) => {
    const cursor = new Date(range.start)
    cursor.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(range.end)
    rangeEnd.setHours(0, 0, 0, 0)
    
    while (cursor <= rangeEnd) {
      // 使用本地時間計算 weekIndex
      const diffDays = Math.floor((cursor - currentWeekStart.value) / dayMs)
      const weekIndex = Math.floor(diffDays / 7)
      
      if (weekIndex >= 0 && weekIndex < weeks.length) {
        const week = weeks[weekIndex]
        const startCol = getMondayBasedDayIndex(cursor)
        
        // 計算在這週的跨度
        const weekEnd = new Date(week.weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        const segmentEnd = weekEnd < rangeEnd ? weekEnd : rangeEnd
        const span = daysBetweenInclusive(cursor, segmentEnd)
        
        // 計算 lane（避免重疊）
        let lane = 0
        const existingSegments = week.segments.filter(s => s.course.id !== course.id)
        const overlappingSegments = existingSegments.filter(s => rangesOverlap(startCol, span, s.startCol, s.span))
        
        while (existingSegments.some(s =>
          s.lane === lane &&
          rangesOverlap(startCol, span, s.startCol, s.span)
        )) {
          lane++
        }

        const colorIndex = chooseSegmentColorIndex(course, overlappingSegments)
        
        week.segments.push({
          key: `${key}|${toDateKey(cursor)}`,
          course,
          startCol,
          span,
          lane,
          colorIndex,
          colorClass: courseColors[colorIndex]
        })

        cursor.setTime(segmentEnd.getTime())
        cursor.setDate(cursor.getDate() + 1)
      } else {
        cursor.setDate(cursor.getDate() + 1)
      }
    }
  })
  
  return weeks
}

const calendarWeeksWithCourses = computed(() => assignCoursesToWeeks())

const getSegmentStyle = (segment) => ({
  left: `calc(${segment.startCol} * 100% / 7 + 2px)`,
  width: `calc(${segment.span} * 100% / 7 - 4px)`,
  top: `${34 + segment.lane * 38}px`
})

const getWeekStyle = (week) => {
  const maxLane = week.segments.reduce((max, segment) => Math.max(max, segment.lane), -1)
  const minHeight = Math.max(112, 40 + (maxLane + 1) * 38)
  return { minHeight: `${minHeight}px` }
}

const hasNoCoursesInView = computed(() => {
  return calendarWeeksWithCourses.value.every(week => week.segments.length === 0)
})
</script>
