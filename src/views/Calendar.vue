<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-ink mb-4">行事曆</h1>

    <!-- 課程／活動篩選 -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="option in kindOptions"
        :key="option.value"
        @click="selectedKind = option.value"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          selectedKind === option.value
            ? 'bg-primary text-white border border-transparent'
            : 'bg-white border border-line text-ink-soft hover:border-ink-faint'
        ]"
      >{{ option.label }}</button>
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

const kindOptions = [
  { value: '', label: '全部' },
  { value: 'course', label: '課程' },
  { value: 'activity', label: '活動' }
]
const selectedKind = ref('')

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

const calendarItems = computed(() => {
  if (selectedKind.value === 'course') return courseItems.value
  if (selectedKind.value === 'activity') return activityItems.value
  return [...courseItems.value, ...activityItems.value]
})
</script>
