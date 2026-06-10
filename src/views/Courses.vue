<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船課程列表</h1>

    <!-- 篩選區 - 多列按鈕 -->
    <div class="mb-4 space-y-3">
      <!-- 第一列：縣市篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearLocationFilter"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
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
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedLocation === location ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ location }}
          </button>
        </div>
      </div>

      <!-- 第二列：月份篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearMonthFilter"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
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
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedMonth === month ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ formatMonthLabel(month) }}
          </button>
        </div>
      </div>

      <!-- 第三列：ASA 等級篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearLevelFilter"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
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
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedLevel === courseCode ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ courseCode }}
          </button>
        </div>
      </div>

    </div>

    <!-- 簡單列表 -->
    <ResponsiveTable
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
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchCourses, fetchSchools } from '../utils/api.js'
import { getLocationOrder } from '../utils/location.js'
import { formatItemDate, parseLocalDate } from '../utils/format.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'


const courses = ref([])
const locations = ref([])
const schools = ref([])
const selectedLocation = ref('')
const selectedMonth = ref('')
const selectedLevel = ref('')

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

const isUpcomingCourse = (course) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = parseDate(course.endDate)
  if (!endDate) return false
  endDate.setHours(0, 0, 0, 0)
  return endDate >= today
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
    .filter(course => isUpcomingCourse(course) && matchesBasicFilters(course))
    .forEach(course => {
      const code = getCourseCode(course.title)
      if (code) codeSet.add(code)
    })
  return Array.from(codeSet).sort()
})

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    // 只顯示尚未結束的課程（結束日期 >= 今天）
    if (!isUpcomingCourse(course)) return false

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

// 清除篩選的輔助函式
const clearLocationFilter = () => { selectedLocation.value = '' }
const clearMonthFilter = () => { selectedMonth.value = '' }
const clearLevelFilter = () => { selectedLevel.value = '' }

onMounted(async () => {
  const coursesData = await fetchCourses()
  const schoolsData = await fetchSchools()
  
  courses.value = coursesData.courses
  schools.value = schoolsData.schools
  
  // 動態提取所有獨特縣市
  const locationSet = new Set()
  
  courses.value.forEach(course => {
    if (course.location) locationSet.add(course.location)
  })
  
  locations.value = Array.from(locationSet).sort((a, b) => getLocationOrder(a) - getLocationOrder(b))
})
</script>
