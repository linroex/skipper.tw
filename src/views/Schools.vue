<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船學校列表</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="school in schoolsWithStats"
        :key="school.id"
        @click="goToSchool(school.id)"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-xl font-bold text-gray-900">{{ school.name }}</h2>
            <span v-if="school.shortName" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {{ school.shortName }}
            </span>
          </div>
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <span class="bg-primary text-white text-xs px-2 py-1 rounded mr-2">
              {{ school.totalCourses }} 課程
            </span>
            <span class="bg-secondary text-white text-xs px-2 py-1 rounded">
              {{ school.totalActivities }} 活動
            </span>
          </div>
          <p class="text-gray-600 text-sm">{{ school.description }}</p>
          <a
            v-if="school.url"
            :href="school.url"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
            class="inline-block mt-3 text-sm text-primary hover:underline"
          >
            官方網站 →
          </a>
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

    <div v-if="schoolsWithStats.length === 0" class="text-center py-12 text-gray-500">
      暫無學校資料
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCourses } from '../utils/api.js'
import { fetchActivities } from '../utils/api.js'
import { fetchSchools } from '../utils/api.js'
import { getLocationOrder, getRegionOrder } from '../utils/location.js'
import { parseLocalDate } from '../utils/format.js'

const router = useRouter()
const courses = ref([])
const activities = ref([])
const schools = ref([])
const schoolDataByUnit = ref(new Map())

const parseDate = parseLocalDate

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
        courses: [],
        activities: []
      })
    }
    schoolMap.get(unit).activities.push(activity)
  })

  // 轉換為陣列並添加統計，使用學校資料檔案中的資訊
  return Array.from(schoolMap.values()).map((schoolData, index) => {
    // 從學校資料檔案中查找對應的學校資訊
    // 使用學校資料中的 unit 來匹配學校名稱
    const sampleCourse = schoolData.courses[0] || schoolData.activities[0]
    const unitName = sampleCourse?.unit || schools.value[index]?.id
    const schoolInfo = schoolDataByUnit.value.get(unitName)
    
    // 取得學校的主要地點（用於排序）
    const locations = schoolInfo?.locations || [...new Set(schoolData.courses.map(c => c.location).filter(Boolean))]
    const primaryLocation = locations.length > 0 ? locations[0] : ''
    
    const displayName = schoolInfo?.name || unitName
    return {
      id: schoolInfo?.id || unitName,
      name: displayName,
      shortName: schoolInfo?.shortName || displayName.substring(0, 4) || '',
      courses: schoolData.courses,
      activities: schoolData.activities,
      totalCourses: schoolData.courses.length,
      totalActivities: schoolData.activities.length,
      certs: schoolInfo?.certs || [...new Set(schoolData.courses.map(c => c.organization).filter(Boolean))],
      description: schoolInfo?.description || `${displayName} - 提供多樣化的帆船課程與活動`,
      url: schoolInfo?.url || '',
      locations: locations,
      primaryLocation: primaryLocation // 用於排序的主要地點
    }
  }).sort((a, b) => {
    // 先按地區排序
    const aRegion = getRegionFromLocation(a.primaryLocation)
    const bRegion = getRegionFromLocation(b.primaryLocation)
    const regionDiff = getRegionOrder(aRegion) - getRegionOrder(bRegion)
    if (regionDiff !== 0) return regionDiff
    
    // 再按地點排序
    const locationDiff = getLocationOrder(a.primaryLocation) - getLocationOrder(b.primaryLocation)
    if (locationDiff !== 0) return locationDiff
    
    // 最後按課程數量排序
    return b.totalCourses - a.totalCourses
  })
})

// 根據地點判斷地區
const getRegionFromLocation = (location) => {
  if (!location) return '北台灣'
  const locationMap = {
    '基隆': '北台灣',
    '台北': '北台灣',
    '新北': '北台灣',
    '桃園': '北台灣',
    '新竹': '北台灣',
    '苗栗': '北台灣',
    '台中': '中台灣',
    '彰化': '中台灣',
    '南投': '中台灣',
    '雲林': '中台灣',
    '嘉義': '南台灣',
    '台南': '南台灣',
    '高雄': '南台灣',
    '屏東': '南台灣',
    '花蓮': '東台灣',
    '宜蘭': '東台灣',
    '澎湖': '南台灣',
    '金門': '南台灣'
  }
  return locationMap[location] || '北台灣'
}

const goToSchool = (schoolId) => {
  router.push({
    name: 'School',
    params: { id: schoolId }
  })
}

onMounted(async () => {
  const coursesData = await fetchCourses()
  const activitiesData = await fetchActivities()
  const schoolsData = await fetchSchools()

  courses.value = coursesData.courses
  activities.value = activitiesData.activities
  schools.value = schoolsData.schools

  // 建立單位名稱到學校 ID 的映射
  const map = new Map()
  schools.value.forEach(school => {
    map.set(school.name, school)
  })
  schoolDataByUnit.value = map
})
</script>
