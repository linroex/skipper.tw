<template>
  <div>
    <!-- 首頁標題 -->
    <section class="mb-12 text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">🚤 skipper.tw</h1>
      <p class="text-xl text-gray-600 mb-6">台灣帆船活動與課程資訊公告平台</p>
      <div class="flex justify-center space-x-4">
        <router-link to="/activities" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition">
          🏄 查看所有活動
        </router-link>
        <router-link to="/courses" class="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-primary transition">
          🎓 查看所有課程
        </router-link>
      </div>
    </section>

    <!-- 即將開始的活動 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">📅 即將開始的活動</h2>
      <router-link to="/activities" class="text-primary hover:underline">查看全部活動 →</router-link>
      
      <div class="mt-4">
        <ResponsiveTable
          :items="upcomingActivities"
          :headers="[ '日期', '活動名稱', '地點' ]"
          :title-key="'title'"
          :header-extra="{
            render: (activity) => formatItemDate(activity),
            tagRender: (activity) => getType(activity.type),
            tagClass: 'bg-primary text-white text-xs px-2 py-1 rounded'
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
      <h2 class="text-2xl font-bold text-gray-800 mb-4">🎓 熱門課程</h2>
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
import ResponsiveTable from '../components/ResponsiveTable.vue'

// SEO meta tags
useHead({
  title: 'skipper.tw - 台灣帆船活動與課程資訊公告平台',
  meta: [
    { name: 'description', content: '台灣帆船活動、課程、體驗、競賽資訊平台，提供北中南東台灣帆船課程、營隊、體驗活動、講座等完整資訊。' },
    { name: 'keywords', content: '帆船課程，帆船體驗，帆船營隊，帆船競賽，帆船講座，台灣帆船，ASA 帆船，IYT 帆船，TSA 帆船' },
    { property: 'og:title', content: 'skipper.tw - 台灣帆船活動與課程資訊公告平台' },
    { property: 'og:description', content: '台灣帆船活動、課程、體驗、競賽資訊平台' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
})

const activities = getActivities()
const courses = getCourses()
const schools = getSchools()

const getType = (typeId) => {
  const typeMap = {
    workshop: '體驗',
    race: '競賽',
    camp: '營隊',
    seminar: '講座'
  }
  return typeMap[typeId] || typeId
}

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

const upcomingActivities = computed(() => {
  return activities
    .filter(isUpcoming)
    .sort(sortByRegionLocationDate)
    .slice(0, 3)
})

const featuredCourses = computed(() => {
  return courses
    .filter(isUpcoming)
    .sort(sortByRegionLocationDate)
    .slice(0, 3)
})
</script>
