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
          :headers="[ '日期', '課程名稱', '認證' ]"
          :title-key="'title'"
          :header-extra="{
            render: (course) => formatItemDate(course),
            tagRender: (course) => course.organization,
            tagClass: 'bg-secondary text-white text-xs px-2 py-1 rounded'
          }"
          :columns="[
            { key: 'organization', label: '認證', render: (course) => course.organization || '-' }
          ]"
          empty-message="暫無熱門課程"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchActivities, fetchCourses } from '../utils/api.js'
import { getLocationOrder, getRegionOrder } from '../utils/location.js'
import { formatItemDate, parseLocalDate } from '../utils/format.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'


const upcomingActivities = ref([])
const featuredCourses = ref([])

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

onMounted(async () => {
  const activitiesData = await fetchActivities()
  const coursesData = await fetchCourses()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 過濾並排序活動（只顯示尚未結束的，按地區→地點→日期排序）
  const validActivities = activitiesData.activities.filter(activity => {
    const endDate = parseDate(activity.endDate)
    endDate.setHours(0, 0, 0, 0)
    return endDate >= today
  }).sort((a, b) => {
    const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
    if (regionDiff !== 0) return regionDiff
    const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
    if (locationDiff !== 0) return locationDiff
    return parseDate(a.startDate) - parseDate(b.startDate)
  })
  
  // 過濾並排序課程（只顯示尚未結束的，按地區→地點→日期排序）
  const validCourses = coursesData.courses.filter(course => {
    const endDate = parseDate(course.endDate)
    endDate.setHours(0, 0, 0, 0)
    return endDate >= today
  }).sort((a, b) => {
    const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
    if (regionDiff !== 0) return regionDiff
    const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
    if (locationDiff !== 0) return locationDiff
    return parseDate(a.startDate) - parseDate(b.startDate)
  })
  
  upcomingActivities.value = validActivities.slice(0, 3)
  featuredCourses.value = validCourses.slice(0, 3)
})
</script>
