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
    <div class="grid grid-cols-7 border-l border-t">
      <div
        v-for="(cell, index) in calendarCells"
        :key="index"
        class="border-r border-b min-h-[80px] md:min-h-[100px] p-1"
        :class="cell.day ? '' : 'bg-gray-50'"
      >
        <div v-if="cell.day">
          <div class="flex justify-center mb-1">
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
          <div
            v-for="course in cell.courses"
            :key="course.id"
            @click="openCourse(course)"
            :class="['text-xs rounded px-1 py-0.5 mb-0.5 cursor-pointer leading-tight truncate', orgColor(course.organization)]"
            :title="course.title"
          >
            <span class="hidden md:block truncate">{{ course.title }}</span>
            <span class="md:hidden">{{ shortTitle(course) }}</span>
          </div>
        </div>
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
            <span :class="['px-2 py-0.5 text-xs rounded font-medium', orgColor(selectedCourse.organization)]">
              {{ selectedCourse.organization }}
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

const shortTitle = (course) => {
  const match = course.title?.match(/ASA\s*\d{2,3}|IYT\s*\d{2,3}/i)
  if (match) return match[0].replace(/\s+/, ' ').toUpperCase()
  return course.title?.substring(0, 5) || ''
}

const orgColor = (org) => {
  switch (org?.toUpperCase()) {
    case 'ASA': return 'bg-sky-100 text-sky-700 hover:bg-sky-200'
    case 'IYT': return 'bg-green-100 text-green-700 hover:bg-green-200'
    case 'TSA': return 'bg-amber-100 text-amber-700 hover:bg-amber-200'
    default:    return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }
}

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())

const coursesByDay = computed(() => {
  const map = new Map()
  props.items.forEach(course => {
    const startDate = parseLocalDate(course.startDate)
    const endDate = parseLocalDate(course.endDate || course.startDate)
    if (!startDate || !endDate) return
    
    // 檢查是否有 dateText，如果有，解析其中的日期
    const dateText = course.dateText
    let datesToDisplay = []
    
    if (dateText) {
      // 解析 dateText，格式如 "6/13(六)、6/14(日)、6/18(四)"
      const dateMatches = dateText.match(/(\d+)\/\d+/g)
      if (dateMatches) {
        datesToDisplay = dateMatches.map(d => {
          const [month, day] = d.split('/').map(Number)
          return { month, day }
        })
      }
    } else {
      // 沒有 dateText，使用整個日期範圍
      let currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        datesToDisplay.push({
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate()
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }
    
    // 添加課程到對應的日期
    datesToDisplay.forEach(dateInfo => {
      // 檢查是否在當前顯示的月份內（假設都是當前年份）
      if (dateInfo.month === currentMonth.value + 1) {
        const day = dateInfo.day
        if (!map.has(day)) map.set(day, [])
        // 避免重複添加同一課程
        const exists = map.get(day).some(c => c.id === course.id)
        if (!exists) {
          map.get(day).push(course)
        }
      }
    })
  })
  return map
})

const calendarCells = computed(() => {
  const cells = []
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    cells.push({ day: null, courses: [] })
  }
  for (let d = 1; d <= daysInMonth.value; d++) {
    cells.push({ day: d, courses: coursesByDay.value.get(d) || [] })
  }
  const remainder = cells.length % 7
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ day: null, courses: [] })
    }
  }
  return cells
})

const hasNoCoursesThisMonth = computed(() => coursesByDay.value.size === 0)
</script>
