<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-800">帆船課程列表</h1>
      <!-- 視圖模式切換 -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          @click="setViewMode('list')"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          ]"
          title="列表模式"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
        <button
          @click="setViewMode('calendar')"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            viewMode === 'calendar' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          ]"
          title="行事曆模式"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 篩選區 - 多列按鈕 -->
    <div class="mb-4 space-y-2">
      <!-- 第一列：縣市篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearLocationFilter"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              !selectedLocation ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            全部縣市
          </button>
          <button
            v-for="location in locations"
            :key="location"
            @click="selectedLocation = location"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedLocation === location ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ location }}
          </button>
        </div>
      </div>

      <!-- 第二列：月份篩選 / 顯示過去 -->
      <div v-if="viewMode !== 'calendar'" class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearMonthFilter"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              !selectedMonth ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            全部月份
          </button>
          <button
            v-for="month in courseMonths"
            :key="month"
            @click="selectedMonth = month"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedMonth === month ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ formatMonthLabel(month) }}
          </button>
          <button
            @click="toggleShowPastCourses"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showPastCourses ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ showPastCourses ? '含過去一年' : '顯示過去一年' }}
          </button>
        </div>
      </div>

      <!-- 第三列：ASA 等級篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearLevelFilter"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              !selectedLevel ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            全部等級
          </button>
          <button
            v-for="courseCode in courseCodes"
            :key="courseCode"
            @click="selectedLevel = courseCode"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedLevel === courseCode ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ courseCode }}
          </button>
        </div>
      </div>

    </div>

    <!-- 列表 / 行事曆 視圖 -->
    <ResponsiveTable
      v-if="viewMode === 'list'"
      :items="filteredCourses"
      :headers="[ '日期', '課程名稱', '學校', '地點', '聯絡' ]"
      :title-key="'title'"
      :header-extra="{
        render: (course) => formatItemDate(course),
        tagRender: null,
        tagClass: ''
      }"
      :columns="[
        { key: 'unit', label: '學校', render: (course) => getSchoolName(course.unit) },
        { key: 'location', label: '地點' },
        {
          key: 'schoolLink',
          label: '聯絡',
          component: 'router-link',
          props: (course) => ({
            to: getSchoolRoute(course.unit),
            class: 'inline-block bg-primary text-white px-3 py-1 rounded-lg text-sm hover:bg-secondary transition'
          }),
          render: () => '前往學校'
        }
      ]"
      empty-message="沒有符合條件的課程"
      :row-class="getCourseRowClass"
    />
    <CourseCalendar
      v-else
      :items="filteredCourses"
      :get-school-name="getSchoolName"
      :get-school-route="getSchoolRoute"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import CourseCalendar from '../components/CourseCalendar.vue'

// SEO meta tags
useHead({
  title: '帆船課程列表 - skipper.tw',
  meta: [
    { name: 'description', content: '查找台灣各地帆船課程，包括 ASA、IYT、TSA 等認證課程。提供初級、中級、高級帆船課程資訊。' }
  ]
})
import { getCourses, getSchools } from '../utils/data.js'
import { getLocationOrder } from '../utils/location.js'
import { formatItemDate, parseLocalDate } from '../utils/format.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'


const courses = ref(getCourses())
const schools = ref(getSchools())
const selectedLocation = ref('')
const selectedMonth = ref('')
const selectedLevel = ref('')
const showPastCourses = ref(false)
const viewMode = ref('list')

const parseDate = parseLocalDate

const schoolByUnit = computed(() => {
  const map = new Map()
  schools.value.forEach(school => map.set(school.name, school))
  return map
})

const getSchool = (unit) => schoolByUnit.value.get(unit)
const getSchoolName = (unit) => getSchool(unit)?.shortName || unit || '-'
const getSchoolRoute = (unit) => {
  const school = getSchool(unit)
  return school ? { name: 'School', params: { id: school.id } } : { name: 'Schools' }
}

const getCourseCode = (title) => {
  if (!title) return ''
  const match = title.match(/ASA\s*\d{2,3}|IYT\s*\d{2,3}/i)
  return match ? match[0].replace(/\s+/, ' ').toUpperCase() : ''
}

const getMonthKey = (date) => {
  const parsedDate = parseDate(date)
  if (!parsedDate) return ''
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
}

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-')
  return `${Number(month)}月`
}

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const getPastYearStart = () => {
  const date = getToday()
  date.setFullYear(date.getFullYear() - 1)
  return date
}

const getCourseEndDate = (course) => {
  const endDate = parseDate(course.endDate || course.startDate)
  if (!endDate) return null
  endDate.setHours(0, 0, 0, 0)
  return endDate
}

const isUpcomingCourse = (course) => {
  const endDate = getCourseEndDate(course)
  if (!endDate) return false
  return endDate >= getToday()
}

const isPastCourse = (course) => {
  const endDate = getCourseEndDate(course)
  if (!endDate) return false
  return endDate < getToday()
}

const getCourseRowClass = (course) => isPastCourse(course) ? 'opacity-60' : ''

const isWithinPastYearOrUpcoming = (course) => {
  const endDate = getCourseEndDate(course)
  if (!endDate) return false
  return endDate >= getPastYearStart()
}

const matchesDateVisibility = (course) => {
  return showPastCourses.value ? isWithinPastYearOrUpcoming(course) : isUpcomingCourse(course)
}

const matchesLocationFilter = (course) => {
  return selectedLocation.value === '' || course.location === selectedLocation.value
}

const matchesMonthFilter = (course) => {
  return selectedMonth.value === '' || getMonthKey(course.startDate) === selectedMonth.value
}

const matchesBasicFilters = (course) => {
  return matchesLocationFilter(course) && matchesMonthFilter(course)
}

const locations = computed(() => {
  const locationSet = new Set()
  courses.value.forEach(course => {
    if (course.location) locationSet.add(course.location)
  })
  return Array.from(locationSet).sort((a, b) => getLocationOrder(a) - getLocationOrder(b))
})

const courseMonths = computed(() => {
  const monthSet = new Set()
  courses.value
    .filter(course => isUpcomingCourse(course) && matchesLocationFilter(course))
    .forEach(course => {
      const month = getMonthKey(course.startDate)
      if (month) monthSet.add(month)
    })
  return Array.from(monthSet).sort()
})

const courseCodes = computed(() => {
  const codeSet = new Set()
  courses.value
    .filter(course => matchesDateVisibility(course) && matchesBasicFilters(course))
    .forEach(course => {
      const code = getCourseCode(course.title)
      if (code) codeSet.add(code)
    })
  return Array.from(codeSet).sort()
})

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    // 預設只顯示尚未結束的課程；開啟後包含過去一年內的課程
    if (!matchesDateVisibility(course)) return false

    const matchLevel = selectedLevel.value === '' || getCourseCode(course.title) === selectedLevel.value
    return matchesBasicFilters(course) && matchLevel
  }).sort((a, b) => {
    // 按開始日期排序：先近後遠
    const dateDiff = parseDate(a.startDate) - parseDate(b.startDate)
    if (dateDiff !== 0) return dateDiff

    // 同一天再按地點排序，讓顯示穩定
    return getLocationOrder(a.location) - getLocationOrder(b.location)
  })
})

const setViewMode = (mode) => {
  viewMode.value = mode
  selectedMonth.value = ''
  showPastCourses.value = mode === 'calendar'
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('coursesViewMode', mode)
  }
}

const toggleShowPastCourses = () => {
  showPastCourses.value = !showPastCourses.value
  selectedMonth.value = ''
}

// 清除篩選的輔助函式
const clearLocationFilter = () => { selectedLocation.value = '' }
const clearMonthFilter = () => { selectedMonth.value = '' }
const clearLevelFilter = () => { selectedLevel.value = '' }

onMounted(() => {
  const savedViewMode = window.localStorage.getItem('coursesViewMode')
  if (savedViewMode === 'calendar') {
    viewMode.value = 'calendar'
    showPastCourses.value = true
  }
})

</script>
