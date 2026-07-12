<template>
  <div>
    <!-- 首頁標題 -->
    <section class="mb-12 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-ink mb-3">台灣帆船資訊網</h1>
      <p class="text-base text-ink-soft mb-6">彙整全台帆船課程、出航活動與考證體驗資訊</p>
      <div class="flex justify-center space-x-3">
        <router-link to="/activities" class="bg-primary text-paper text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-secondary transition">
          查看所有活動
        </router-link>
        <router-link to="/courses" class="border border-line text-ink text-sm font-medium px-6 py-2.5 rounded-lg hover:border-primary hover:text-primary transition">
          查看所有課程
        </router-link>
      </div>
    </section>

    <!-- 即將開始的活動 -->
    <section class="mb-12">
      <h2 class="text-xl font-bold text-ink mb-2">即將開始的活動</h2>
      <router-link to="/activities" class="text-primary hover:underline">查看全部活動 →</router-link>
      
      <div class="mt-4">
        <ResponsiveTable
          :items="upcomingActivities"
          :headers="[ '日期', '活動名稱', '地點' ]"
          :title-key="'title'"
          :header-extra="{
            render: (activity) => formatSchedule(activity),
            tagRender: (activity) => getTypeLabel(activity.type),
            tagClass: 'bg-primary text-paper text-xs px-2 py-1 rounded'
          }"
          :columns="[
            { key: 'location', label: '地點', render: (activity) => `${activity.location} (${activity.region})` }
          ]"
          empty-message="暫無即將開始的活動"
        />
      </div>
    </section>

    <!-- 熱門課程 -->
    <section>
      <h2 class="text-xl font-bold text-ink mb-2">熱門課程</h2>
      <router-link to="/courses" class="text-primary hover:underline">查看全部課程 →</router-link>
      
      <div class="mt-4">
        <ResponsiveTable
          :items="featuredCourses"
          :headers="[ '日期', '課程名稱', '學校' ]"
          :title-key="'title'"
          :header-extra="{
            render: (course) => formatItemDate(course),
            tagRender: null,
            tagClass: ''
          }"
          :columns="[
            { key: 'unit', label: '學校', render: (course) => getSchoolName(course.unit) }
          ]"
          empty-message="暫無熱門課程"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { getActivities, getCourses, getSchools } from '../utils/data.js'
import { getLocationOrder, getRegionOrder } from '../utils/location.js'
import { formatItemDate, parseLocalDate } from '../utils/format.js'
import { getTypeLabel, formatSchedule, getActivityStartDate, isUpcomingActivity } from '../utils/activity.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'

// SEO meta tags
useHead({
  title: '台灣帆船資訊網｜帆船課程、活動、考證體驗 - skipper.tw',
  meta: [
    { name: 'description', content: '台灣帆船資訊網彙整全台帆船課程、出航活動、ASA 考證與帆船體驗資訊，涵蓋基隆、宜蘭、花蓮、高雄、澎湖等地帆船學校與揪團航海。' },
    { name: 'keywords', content: '帆船課程，學帆船，帆船體驗，帆船活動，帆船考證，ASA 帆船，台灣帆船，帆船學校，揪團航海' },
    { property: 'og:title', content: '台灣帆船資訊網｜帆船課程、活動、考證體驗 - skipper.tw' },
    { property: 'og:description', content: '彙整全台帆船課程、出航活動、ASA 考證與帆船體驗資訊' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
})

const activities = getActivities()
const courses = getCourses()
const schools = getSchools()

const parseDate = parseLocalDate

const schoolByUnit = computed(() => {
  const map = new Map()
  schools.forEach(school => map.set(school.name, school))
  return map
})

const getSchoolName = (unit) => schoolByUnit.value.get(unit)?.shortName || unit || '-'

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const isUpcoming = (item) => {
  const endDate = parseDate(item.endDate || item.date || item.startDate)
  if (!endDate) return false
  endDate.setHours(0, 0, 0, 0)
  return endDate >= getToday()
}

const sortByRegionLocationDate = (a, b) => {
  const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
  if (regionDiff !== 0) return regionDiff
  const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
  if (locationDiff !== 0) return locationDiff
  return parseDate(a.startDate) - parseDate(b.startDate)
}

const sortActivities = (a, b) => {
  const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
  if (regionDiff !== 0) return regionDiff
  const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
  if (locationDiff !== 0) return locationDiff
  return (getActivityStartDate(a) ?? 0) - (getActivityStartDate(b) ?? 0)
}

const upcomingActivities = computed(() => {
  return activities
    .filter(isUpcomingActivity)
    .sort(sortActivities)
    .slice(0, 3)
})

const featuredCourses = computed(() => {
  return courses
    .filter(isUpcoming)
    .sort(sortByRegionLocationDate)
    .slice(0, 3)
})
</script>
