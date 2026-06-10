<template>
  <div>
    <div v-if="loading" class="text-center py-12 text-gray-500">
      載入中...
    </div>

    <div v-else-if="school" class="space-y-6">
      <!-- 學校資訊 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center gap-3 mb-4">
          <h1 class="text-3xl font-bold text-gray-900">{{ school.name }}</h1>
          <span v-if="school.shortName" class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {{ school.shortName }}
          </span>
        </div>
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
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">相關課程</h2>
          
          <!-- 課程篩選器 -->
          <div class="space-y-3">
            <!-- 第一列：認證類型篩選 -->
            <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
              <div class="flex gap-2 inline-flex">
                <button
                  @click="clearCertFilter"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    !selectedCert ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  全部認證
                </button>
                <button
                  v-for="cert in schoolCerts"
                  :key="cert"
                  @click="selectedCert = cert"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedCert === cert ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ cert }}
                </button>
              </div>
            </div>

            <!-- 第二列：課程編號篩選 -->
            <div v-if="selectedCert && currentCourseCodes.length > 0" class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
              <div class="flex gap-2 inline-flex">
                <button
                  @click="clearLevelFilter"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    !selectedLevel ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  全部課程
                </button>
                <button
                  v-for="courseCode in currentCourseCodes"
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
        </div>

        <ResponsiveTable
          :items="filteredCourses"
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
        <router-link :to="`/schools/${school?.id}`" class="text-primary hover:underline">
          ← 返回學校列表
        </router-link>
      </div>

      <!-- URL 顯示（開發用） -->
      <div v-if="school?.id" class="mt-4 text-sm text-gray-500">
        學校網址：/schools/{{ school.id }}
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
import { fetchSchools } from '../utils/api.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'


const route = useRoute()
const loading = ref(true)
const school = ref(null)
const courses = ref([])
const activities = ref([])
const schools = ref([])
const schoolDataMap = ref(new Map())
const selectedCert = ref('')
const selectedLevel = ref('')
const schoolCourseCodes = ref({})

const parseDate = (date) => new Date(`${date}T00:00:00`)

const schoolData = computed(() => {
  const schoolId = decodeURIComponent(route.params.id)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 根據學校 ID 找到學校資料
  const schoolInfo = schoolDataMap.value.get(schoolId)
  if (!schoolInfo) return null
  
  const schoolName = schoolInfo.name
  
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

  const certs = schoolInfo.certs || [...new Set(schoolCourses.map(c => c.organization).filter(Boolean))]
  const locations = schoolInfo.locations || [...new Set(schoolCourses.map(c => c.location).filter(Boolean))]

  return {
    id: schoolId,
    name: schoolName,
    shortName: schoolInfo.shortName,
    courses: schoolCourses,
    activities: schoolActivities,
    totalCourses: schoolCourses.length,
    totalActivities: schoolActivities.length,
    certs: certs,
    locations: locations,
    description: schoolInfo.description || `${schoolName} - 提供多樣化的帆船課程與活動`
  }
})

// 學校的認證列表
const schoolCerts = computed(() => {
  return school.value?.certs || []
})

// 提取課程編號的函式
const getCourseCode = (title) => {
  if (!title) return ''
  const match = title.match(/ASA \d{3}|ASA\s*\d{3}|ASA \d{2}|ASA\s*\d{2}/i)
  return match ? match[0].toUpperCase() : ''
}

// 為每個認證組織提取課程編號
const getCourseCodesForCert = (cert) => {
  if (!school.value) return []
  
  const certCourses = school.value.courses.filter(course => {
    return course.organization === cert
  })
  
  const codeSet = new Set()
  certCourses.forEach(course => {
    const courseCode = getCourseCode(course.title)
    if (courseCode) {
      codeSet.add(courseCode)
    }
  })
  
  return Array.from(codeSet).sort()
}

// 根據當前選擇的認證，顯示實際有開過的課程編號
const currentCourseCodes = computed(() => {
  if (!selectedCert.value || !school.value) return []
  
  return getCourseCodesForCert(selectedCert.value)
})

// 篩選後的課程
const filteredCourses = computed(() => {
  if (!school.value) return []
  
  let filtered = [...school.value.courses]
  
  // 根據認證篩選
  if (selectedCert.value) {
    filtered = filtered.filter(course => course.organization === selectedCert.value)
  }
  
  // 根據課程編號篩選
  if (selectedLevel.value) {
    filtered = filtered.filter(course => getCourseCode(course.title) === selectedLevel.value)
  }
  
  return filtered
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

// 清除篩選的輔助函式
const clearCertFilter = () => { selectedCert.value = ''; selectedLevel.value = '' }
const clearLevelFilter = () => { selectedLevel.value = '' }

onMounted(async () => {
  const coursesData = await fetchCourses()
  const activitiesData = await fetchActivities()
  const schoolsData = await fetchSchools()

  courses.value = coursesData.courses
  activities.value = activitiesData.activities
  schools.value = schoolsData.schools

  // 建立學校 ID 到學校資料的映射
  schoolDataMap.value = new Map()
  schools.value.forEach(school => {
    schoolDataMap.value.set(school.id, school)
  })

  school.value = schoolData.value
  loading.value = false
})
</script>
