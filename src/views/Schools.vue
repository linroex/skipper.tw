<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船學校列表</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="school in schools"
        :key="school.name"
        @click="goToSchool(school.name)"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      >
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ school.name }}</h2>
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <span class="bg-primary text-white text-xs px-2 py-1 rounded mr-2">
              {{ school.totalCourses }} 課程
            </span>
            <span class="bg-secondary text-white text-xs px-2 py-1 rounded">
              {{ school.totalActivities }} 活動
            </span>
          </div>
          <p class="text-gray-600 text-sm">{{ school.description }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="cert in school.certs"
              :key="cert"
              class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {{ cert }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="schools.length === 0" class="text-center py-12 text-gray-500">
      暫無學校資料
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCourses } from '../utils/api.js'
import { fetchActivities } from '../utils/api.js'

const router = useRouter()
const courses = ref([])
const activities = ref([])
const schools = ref([])

const parseDate = (date) => new Date(`${date}T00:00:00`)

const schoolsWithStats = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const schoolMap = new Map()

  // 從課程中提取學校（只包含尚未結束的課程）
  courses.value.forEach(course => {
    const unit = course.unit
    if (!unit) return
    
    const endDate = parseDate(course.endDate)
    endDate.setHours(0, 0, 0, 0)
    // 如果結束日期在過去，不顯示
    if (endDate < today) return

    if (!schoolMap.has(unit)) {
      schoolMap.set(unit, {
        name: unit,
        courses: [],
        activities: []
      })
    }
    schoolMap.get(unit).courses.push(course)
  })

  // 從活動中提取學校（只包含尚未結束的活動）
  activities.value.forEach(activity => {
    const unit = activity.unit
    if (!unit) return
    
    const endDate = parseDate(activity.endDate)
    endDate.setHours(0, 0, 0, 0)
    // 如果結束日期在過去，不顯示
    if (endDate < today) return

    if (!schoolMap.has(unit)) {
      schoolMap.set(unit, {
        name: unit,
        courses: [],
        activities: []
      })
    }
    schoolMap.get(unit).activities.push(activity)
  })

  // 轉換為陣列並添加統計
  return Array.from(schoolMap.values()).map(school => ({
    ...school,
    totalCourses: school.courses.length,
    totalActivities: school.activities.length,
    certs: [...new Set(school.courses.map(c => c.organization).filter(Boolean))],
    description: `${school.name} - 提供多樣化的帆船課程與活動`,
    locations: [...new Set(school.courses.map(c => c.location).filter(Boolean))]
  })).sort((a, b) => b.totalCourses - a.totalCourses)
})

const goToSchool = (schoolName) => {
  router.push({
    name: 'School',
    params: { name: encodeURIComponent(schoolName) }
  })
}

onMounted(async () => {
  const coursesData = await fetchCourses()
  const activitiesData = await fetchActivities()

  courses.value = coursesData.courses
  activities.value = activitiesData.activities

  schools.value = schoolsWithStats.value
})
</script>
