<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-ink mb-4">行事曆</h1>

    <!-- 課程／活動篩選 -->
    <div class="mb-4 space-y-2">
      <div class="flex gap-2">
        <button
          v-for="option in kindOptions"
          :key="option.value"
          @click="selectedKind = option.value"
          :class="pillClass(selectedKind === option.value)"
        >{{ option.label }}</button>
      </div>

      <!-- 課程限定篩選：縣市 -->
      <div v-if="selectedKind === 'course'" class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="selectedLocation = ''"
            :class="pillClass(!selectedLocation)"
          >全部縣市</button>
          <button
            v-for="location in locations"
            :key="location"
            @click="selectedLocation = location"
            :class="pillClass(selectedLocation === location)"
          >{{ location }}</button>
        </div>
      </div>

      <!-- 課程限定篩選：ASA 等級 -->
      <div v-if="selectedKind === 'course'" class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="selectedLevel = ''"
            :class="pillClass(!selectedLevel, 'accent')"
          >全部等級</button>
          <button
            v-for="courseCode in courseCodes"
            :key="courseCode"
            @click="selectedLevel = courseCode"
            :class="pillClass(selectedLevel === courseCode, 'accent')"
          >{{ courseCode }}</button>
        </div>
      </div>
    </div>

    <CourseCalendar
      :items="calendarItems"
      :get-school-name="getSchoolName"
      :get-school-route="getSchoolRoute"
    />

    <p class="mt-3 text-xs text-ink-faint">揪團成行的活動沒有固定日期，不會出現在行事曆上，請到「活動」頁查看。</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { getActivities, getCourses, getSchools } from '../utils/data.js'
import { getScheduleType } from '../utils/activity.js'
import { getLocationOrder } from '../utils/location.js'
import CourseCalendar from '../components/CourseCalendar.vue'

useHead({
  title: '帆船行事曆 - skipper.tw',
  meta: [
    { name: 'description', content: '台灣帆船課程與活動行事曆，依月份查看各地開課與出航日期。' }
  ]
})

const courses = getCourses()
const activities = getActivities()
const schools = ref(getSchools())

// 課程與活動二選一，不混排
const kindOptions = [
  { value: 'course', label: '課程' },
  { value: 'activity', label: '活動' }
]
const selectedKind = ref('course')
const selectedLocation = ref('')
const selectedLevel = ref('')

const pillClass = (active, color = 'primary') => {
  const activeClass = color === 'accent'
    ? 'bg-accent text-paper border border-transparent'
    : 'bg-primary text-paper border border-transparent'
  return [
    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
    active ? activeClass : 'bg-surface border border-line text-ink-soft hover:border-ink-faint'
  ]
}

const schoolByUnit = computed(() => {
  const map = new Map()
  schools.value.forEach(school => map.set(school.name, school))
  return map
})

const getSchoolName = (unit) => schoolByUnit.value.get(unit)?.shortName || unit || '-'
const getSchoolRoute = (unit) => {
  const school = schoolByUnit.value.get(unit)
  return school ? { name: 'School', params: { id: school.id } } : { name: 'Schools' }
}

// 與課程頁相同的等級判斷
const getCourseCode = (title) => {
  if (!title) return ''
  const match = title.match(/ASA\s*\d{2,3}|IYT\s*\d{2,3}/i)
  return match ? match[0].replace(/\s+/, ' ').toUpperCase() : ''
}

const locations = computed(() => {
  const locationSet = new Set()
  courses.forEach(course => {
    if (course.location) locationSet.add(course.location)
  })
  return Array.from(locationSet).sort((a, b) => getLocationOrder(a) - getLocationOrder(b))
})

const courseCodes = computed(() => {
  const codeSet = new Set()
  courses
    .filter(course => !selectedLocation.value || course.location === selectedLocation.value)
    .forEach(course => {
      const code = getCourseCode(course.title)
      if (code) codeSet.add(code)
    })
  return Array.from(codeSet).sort()
})

// 活動展開成行事曆項目：fixed 一筆、recurring 每梯次一筆；flexible（揪團）沒有日期不上曆
const activityItems = computed(() => {
  return activities.flatMap(activity => {
    const schedule = activity.schedule || {}
    const base = {
      title: activity.title,
      unit: activity.unit,
      location: activity.location,
      url: activity.url,
      isActivity: true
    }
    switch (getScheduleType(activity)) {
      case 'fixed':
        return [{
          ...base,
          id: `a${activity.id}`,
          startDate: schedule.startDate,
          endDate: schedule.endDate || schedule.startDate
        }]
      case 'recurring':
        return (schedule.sessions || []).map((session, index) => ({
          ...base,
          id: `a${activity.id}-${index}`,
          startDate: session,
          endDate: session
        }))
      default:
        return []
    }
  })
})

const courseItems = computed(() => courses.map(course => ({ ...course, isActivity: false })))

// 課程模式套用縣市／等級篩選（與課程頁一致）
const filteredCourseItems = computed(() => {
  return courseItems.value.filter(course => {
    const matchLocation = !selectedLocation.value || course.location === selectedLocation.value
    const matchLevel = !selectedLevel.value || getCourseCode(course.title) === selectedLevel.value
    return matchLocation && matchLevel
  })
})

const calendarItems = computed(() => {
  return selectedKind.value === 'activity' ? activityItems.value : filteredCourseItems.value
})
</script>
