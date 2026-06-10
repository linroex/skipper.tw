<template>
  <div>
    <div v-if="loading" class="text-center py-12 text-gray-500">
      載入中...
    </div>

    <div v-else-if="school" class="space-y-6">
      <!-- 學校資訊 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ school.name }}</h1>
        <div class="flex flex-wrap gap-3 mb-4">
          <span class="bg-primary text-white text-sm px-3 py-1 rounded-full">
            {{ school.totalCourses }} 課程
          </span>
          <span class="bg-secondary text-white text-sm px-3 py-1 rounded-full">
            {{ school.totalActivities }} 活動
          </span>
        </div>
        <p class="text-gray-600 mb-4">{{ school.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="cert in school.certs"
            :key="cert"
            class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
          >
            {{ cert }} 認證
          </span>
        </div>
        <div class="mt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">服務地區:</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="loc in school.locations"
              :key="loc"
              class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
            >
              {{ loc }}
            </span>
          </div>
        </div>
      </div>

      <!-- 課程列表 -->
      <div v-if="school.courses.length > 0">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">相關課程</h2>
        <ResponsiveTable
          :items="school.courses"
          :headers="[ '日期', '課程名稱', '認證', '地點', '價格', '聯絡' ]"
          :title-key="'title'"
          :header-extra="{
            render: (course) => formatDateRange(course.startDate, course.endDate),
            tagRender: (course) => course.organization,
            tagClass: 'bg-secondary text-white text-xs px-2 py-1 rounded'
          }"
          :columns="[
            { key: 'organization', label: '認證', render: (course) => course.organization || '-' },
            { key: 'location', label: '地點' },
            { key: 'price', label: '價格', render: (course) => formatPrice(course.price) },
            { key: 'contact', label: '聯絡' }
          ]"
          empty-message="暫無相關課程"
        />
      </div>

      <!-- 活動列表 -->
      <div v-if="school.activities.length > 0">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">相關活動</h2>
        <ResponsiveTable
          :items="school.activities"
          :headers="[ '日期', '活動名稱', '地點', '主辦', '價格', '聯絡' ]"
          :title-key="'title'"
          :header-extra="{
            render: (activity) => formatDateRange(activity.startDate, activity.endDate),
            tagRender: (activity) => getType(activity.type),
            tagClass: 'bg-primary text-white text-xs px-2 py-1 rounded'
          }"
          :columns="[
            { key: 'location', label: '地點' },
            { key: 'unit', label: '主辦' },
            { key: 'price', label: '價格', render: (activity) => formatPrice(activity.price) },
            { key: 'contact', label: '聯絡' }
          ]"
          empty-message="暫無相關活動"
        />
      </div>

      <!-- 沒有資料 -->
      <div v-if="school.courses.length === 0 && school.activities.length === 0" class="text-center py-12 text-gray-500">
        暫無相關課程或活動
      </div>

      <!-- 返回連結 -->
      <div class="mt-6">
        <router-link to="/schools" class="text-primary hover:underline">← 返回學校列表</router-link>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      學校資料不存在
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchCourses } from '../utils/api.js'
import { fetchActivities } from '../utils/api.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'


const route = useRoute()
const loading = ref(true)
const school = ref(null)
const courses = ref([])
const activities = ref([])

const parseDate = (date) => new Date(`${date}T00:00:00`)

const schoolData = computed(() => {
  const schoolName = decodeURIComponent(route.params.name)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 過濾並排序課程（只顯示尚未結束的，按開始日期排序）
  const schoolCourses = courses.value
    .filter(c => c.unit === schoolName) // 只篩選該學校
    .filter(c => {
      const endDate = parseDate(c.endDate)
      endDate.setHours(0, 0, 0, 0)
      return endDate >= today // 只顯示尚未結束的課程
    })
    .sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate))
  
  // 過濾並排序活動（只顯示尚未結束的，按開始日期排序）
  const schoolActivities = activities.value
    .filter(a => a.unit === schoolName) // 只篩選該學校
    .filter(a => {
      const endDate = parseDate(a.endDate)
      endDate.setHours(0, 0, 0, 0)
      return endDate >= today // 只顯示尚未結束的活動
    })
    .sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate))

  const certs = [...new Set(schoolCourses.map(c => c.organization).filter(Boolean))]
  const locations = [...new Set(schoolCourses.map(c => c.location).filter(Boolean))]

  return {
    name: schoolName,
    courses: schoolCourses,
    activities: schoolActivities,
    totalCourses: schoolCourses.length,
    totalActivities: schoolActivities.length,
    certs: certs,
    locations: locations,
    description: `${schoolName} - 提供多樣化的帆船課程與活動`
  }
})

const getType = (typeId) => {
  const typeMap = {
    workshop: '體驗',
    race: '競賽',
    camp: '營隊',
    seminar: '講座'
  }
  return typeMap[typeId] || typeId
}

const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const formatDateRange = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`
  const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const startDay = weekDays[startDate.getDay()]
  const endDay = weekDays[endDate.getDay()]

  return `${startStr}-${endStr} (${startDay}-${endDay})`
}

const formatPrice = (price) => {
  if (price === null || price === undefined || price === 0) return '需洽詢'
  return 'NT$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(async () => {
  const coursesData = await fetchCourses()
  const activitiesData = await fetchActivities()

  courses.value = coursesData.courses
  activities.value = activitiesData.activities

  school.value = schoolData.value
  loading.value = false
})
</script>
