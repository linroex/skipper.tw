<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Header with month navigation -->
    <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
      <button
        @click="prevMonth"
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition text-gray-600 text-xl font-light"
      >
        ‹
      </button>
      <h2 class="text-base font-bold text-gray-800">
        {{ currentYear }} 年 {{ currentMonth + 1 }} 月
      </h2>
      <button
        @click="nextMonth"
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition text-gray-600 text-xl font-light"
      >
        ›
      </button>
    </div>

    <!-- Day of week headers -->
    <div class="grid grid-cols-7 bg-gray-50 border-b">
      <div
        v-for="(day, i) in ['日', '一', '二', '三', '四', '五', '六']"
        :key="day"
        :class="[
          'py-2 text-center text-xs font-medium',
          i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
        ]"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="border-l border-t">
      <div
        v-for="(week, weekIndex) in calendarWeeks"
        :key="weekIndex"
        class="relative grid grid-cols-7"
        :style="getWeekStyle(week)"
      >
        <div
          v-for="cell in week.cells"
          :key="`${weekIndex}-${cell.day ?? cell.placeholderIndex}`"
          class="border-r border-b p-1"
          :class="cell.day ? '' : 'bg-gray-50'"
        >
          <div v-if="cell.day" class="flex justify-center">
            <span
              :class="[
                'w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full',
                isToday(cell.day)
                  ? 'bg-primary text-white'
                  : 'text-gray-600'
              ]"
            >
              {{ cell.day }}
            </span>
          </div>
        </div>

        <button
          v-for="segment in week.segments"
          :key="segment.key"
          type="button"
          @click="openCourse(segment.course)"
          :class="[
            'absolute h-5 md:h-6 rounded px-1 text-[10px] md:text-xs leading-5 md:leading-6 cursor-pointer truncate text-left shadow-sm hover:brightness-95 transition',
            getCourseColor(segment.course)
          ]"
          :style="getSegmentStyle(segment)"
          :title="`${shortTitle(segment.course)} ${segment.course.title}`"
        >
          {{ shortTitle(segment.course) }}
        </button>
      </div>
    </div>

    <!-- Empty state for this month -->
    <div v-if="hasNoCoursesThisMonth" class="py-8 text-center text-sm text-gray-400">
      本月沒有符合條件的課程
    </div>

    <!-- Course detail modal -->
    <Teleport to="body">
      <div
        v-if="selectedCourse"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="selectedCourse = null"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-5">
          <div class="flex items-start justify-between mb-3">
            <span :class="['px-2 py-0.5 text-xs rounded font-medium', getCourseColor(selectedCourse)]">
              {{ selectedCourse.title }}
            </span>
            <button
              @click="selectedCourse = null"
              class="text-gray-400 hover:text-gray-600 leading-none text-lg"
            >
              ✕
            </button>
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-3 leading-snug">
            {{ selectedCourse.title }}
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex gap-3">
              <span class="text-gray-400 w-12 shrink-0">日期</span>
              <span class="text-gray-700">{{ formatItemDate(selectedCourse) }}</span>
            </div>
            <div class="flex gap-3">
              <span class="text-gray-400 w-12 shrink-0">學校</span>
              <span class="text-gray-700">{{ getSchoolName(selectedCourse.unit) }}</span>
            </div>
            <div class="flex gap-3">
              <span class="text-gray-400 w-12 shrink-0">地點</span>
              <span class="text-gray-700">{{ selectedCourse.location }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t">
            <router-link
              :to="getSchoolRoute(selectedCourse.unit)"
              class="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-secondary transition"
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
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const selectedCourse = ref(null)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const isToday = (day) =>
  day === today.getDate() &&
  currentMonth.value === today.getMonth() &&
  currentYear.value === today.getFullYear()

const openCourse = (course) => { selectedCourse.value = course }

// 17 種高對比度、容易區分的配色方案
// 使用鮮豔背景 + 深色文字，確保每個顏色都很容易分辨
const courseColors = [
  // 紅色系 - 溫暖鮮明
  'bg-red-500 text-white hover:bg-red-600',         // 鮮紅
  'bg-rose-500 text-white hover:bg-rose-600',       // 玫紅
  
  // 橙色系 - 明亮溫暖
  'bg-orange-500 text-white hover:bg-orange-600',   // 亮橙
  'bg-amber-500 text-white hover:bg-amber-600',     // 琥珀
  
  // 黃色系 - 最明亮
  'bg-yellow-400 text-yellow-900 hover:bg-yellow-500', // 金黃
  
  // 綠色系 - 清新自然
  'bg-green-500 text-white hover:bg-green-600',     // 翠綠
  'bg-lime-500 text-white hover:bg-lime-600',       // 酸橙綠
  
  // 藍綠色系 - 沉穩
  'bg-teal-500 text-white hover:bg-teal-600',       // 青色
  
  // 藍色系 - 冷靜專業
  'bg-cyan-500 text-white hover:bg-cyan-600',       // 天藍
  'bg-sky-500 text-white hover:bg-sky-600',         // 天空藍
  'bg-blue-500 text-white hover:bg-blue-600',       // 寶藍
  
  // 紫色系 - 優雅神秘
  'bg-indigo-500 text-white hover:bg-indigo-600',   // 靛藍
  'bg-violet-500 text-white hover:bg-violet-600',   // 紫羅蘭
  'bg-purple-500 text-white hover:bg-purple-600',   // 紫色
  
  // 粉紅色系 - 溫柔活潑
  'bg-fuchsia-500 text-white hover:bg-fuchsia-600', // 洋紅
  'bg-pink-500 text-white hover:bg-pink-600',       // 粉紅
  
  // 灰色系 - 中性百搭
  'bg-gray-500 text-white hover:bg-gray-600',       // 灰色
]

// 使用 Map 來追蹤課程顏色分配，確保每個獨特課程都有獨立顏色
const courseColorCache = new Map()

// 獲取課程的顏色
// 使用 學校 + 標題 + 日期 組合，確保不同學校的相同課程使用不同顏色
const getCourseColor = (course) => {
  const courseKey = `${course.unit}|${course.title}|${course.startDate}|${course.endDate}`
  
  if (courseColorCache.has(courseKey)) {
    return courseColorCache.get(courseKey)
  }
  
  // 計算課程的穩定索引
  let hash = 0
  for (let i = 0; i < courseKey.length; i++) {
    hash = ((hash << 5) - hash) + courseKey.charCodeAt(i)
    hash = hash & hash
  }
  const baseIndex = Math.abs(hash) % courseColors.length
  
  // 找到第一個可用的顏色（避免衝突）
  let color = courseColors[baseIndex]
  let attempts = 0
  const maxAttempts = courseColors.length
  
  while (Array.from(courseColorCache.values()).includes(color) && attempts < maxAttempts) {
    attempts++
    const nextIndex = (baseIndex + attempts) % courseColors.length
    color = courseColors[nextIndex]
  }
  
  // 確保顏色沒有被使用過，如果有，循環到下一個
  const usedColors = Array.from(courseColorCache.values())
  if (usedColors.includes(color)) {
    console.warn(`警告：課程衝突，使用預設顏色 ${courseColors[0]}`)
    color = courseColors[0]
  }
  
  courseColorCache.set(courseKey, color)
  return color
}

// 縮短課程名稱
const shortTitle = (course) => {
  const match = course.title?.match(/ASA\s*\d{2,3}|IYT\s*\d{2,3}/i)
  if (match) {
    return match[0].replace(/\s+/, ' ').toUpperCase()
  }
  // 如果沒有課程代碼，顯示前 5 個字
  return course.title?.substring(0, 5) || ''
}

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())

const toDateKey = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const getCourseDates = (course) => {
  const startDate = parseLocalDate(course.startDate)
  const endDate = parseLocalDate(course.endDate || course.startDate)
  if (!startDate || !endDate) return []

  if (course.dateText) {
    const dateMatches = course.dateText.match(/\d+\/\d+/g)
    if (dateMatches) {
      return dateMatches.map(d => {
        const [month, day] = d.split('/').map(Number)
        return new Date(currentYear.value, month - 1, day)
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

const courseDateRanges = computed(() => {
  const monthStart = new Date(currentYear.value, currentMonth.value, 1)
  const monthEnd = new Date(currentYear.value, currentMonth.value + 1, 0)

  return props.items.flatMap(course => {
    const datesInMonth = getCourseDates(course).filter(date => date >= monthStart && date <= monthEnd)
    return mergeConsecutiveDates(datesInMonth).map((range, rangeIndex) => ({
      course,
      range,
      key: `${course.unit}|${course.title}|${course.startDate}|${course.endDate}|${rangeIndex}`
    }))
  })
})

const coursesByDay = computed(() => {
  const map = new Map()

  courseDateRanges.value.forEach(({ course, range }) => {
    const cursor = new Date(range.start)
    while (cursor <= range.end) {
      const day = cursor.getDate()
      if (!map.has(day)) map.set(day, [])
      if (!map.get(day).some(existingCourse => existingCourse.id === course.id)) {
        map.get(day).push(course)
      }
      cursor.setDate(cursor.getDate() + 1)
    }
  })

  return map
})

const calendarCells = computed(() => {
  const cells = []
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    cells.push({ day: null, placeholderIndex: `start-${i}` })
  }
  for (let d = 1; d <= daysInMonth.value; d++) {
    cells.push({ day: d })
  }
  const remainder = cells.length % 7
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ day: null, placeholderIndex: `end-${i}` })
    }
  }
  return cells
})

const splitRangeByWeek = ({ course, range, key }) => {
  const segments = []
  let cursor = new Date(range.start)

  while (cursor <= range.end) {
    const weekIndex = Math.floor((firstDayOfMonth.value + cursor.getDate() - 1) / 7)
    const startCol = cursor.getDay()
    const daysLeftInWeek = 7 - startCol
    const segmentEnd = new Date(cursor)
    segmentEnd.setDate(cursor.getDate() + daysLeftInWeek - 1)
    if (segmentEnd > range.end) segmentEnd.setTime(range.end.getTime())

    const span = segmentEnd.getDate() - cursor.getDate() + 1
    segments.push({
      key: `${key}|${toDateKey(cursor)}`,
      course,
      weekIndex,
      startCol,
      span,
      lane: 0
    })

    cursor = new Date(segmentEnd)
    cursor.setDate(cursor.getDate() + 1)
  }

  return segments
}

const weeklySegments = computed(() => {
  const weeks = Array.from({ length: Math.ceil(calendarCells.value.length / 7) }, () => [])

  courseDateRanges.value
    .flatMap(splitRangeByWeek)
    .sort((a, b) => a.weekIndex - b.weekIndex || a.startCol - b.startCol || b.span - a.span)
    .forEach(segment => {
      const weekSegments = weeks[segment.weekIndex]
      const lanes = []

      weekSegments.forEach(existingSegment => {
        lanes[existingSegment.lane] ||= []
        lanes[existingSegment.lane].push(existingSegment)
      })

      let lane = 0
      while (lanes[lane]?.some(existingSegment =>
        segment.startCol < existingSegment.startCol + existingSegment.span &&
        segment.startCol + segment.span > existingSegment.startCol
      )) {
        lane++
      }

      weekSegments.push({ ...segment, lane })
    })

  return weeks
})

const calendarWeeks = computed(() => {
  const weeks = []
  for (let i = 0; i < calendarCells.value.length; i += 7) {
    const weekIndex = i / 7
    weeks.push({
      cells: calendarCells.value.slice(i, i + 7),
      segments: weeklySegments.value[weekIndex] || []
    })
  }
  return weeks
})

const getSegmentStyle = (segment) => ({
  left: `calc(${segment.startCol} * 100% / 7 + 2px)`,
  width: `calc(${segment.span} * 100% / 7 - 4px)`,
  top: `${34 + segment.lane * 24}px`
})

const getWeekStyle = (week) => {
  const maxLane = week.segments.reduce((max, segment) => Math.max(max, segment.lane), -1)
  const minHeight = Math.max(112, 40 + (maxLane + 1) * 24)
  return { minHeight: `${minHeight}px` }
}

const hasNoCoursesThisMonth = computed(() => coursesByDay.value.size === 0)
</script>
