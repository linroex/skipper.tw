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

      <!-- 第二列：認證類型篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearOrganizationFilter"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              !selectedOrganization ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            全部認證
          </button>
          <button
            v-for="org in organizations"
            :key="org"
            @click="selectedOrganization = org"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedOrganization === org ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ org }}
          </button>
        </div>
      </div>

      <!-- 第三列：課程編號篩選（根據認證類型動態顯示） -->
      <div v-if="selectedOrganization && currentCourseCodes.length > 0" class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
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

      <!-- 搜尋框 -->
      <div>
        <input
          v-model="search"
          type="text"
          placeholder="搜尋課程名稱或地點..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>
    </div>

    <!-- 簡單列表 -->
    <ResponsiveTable
      :items="filteredCourses"
      :headers="[ '日期', '課程名稱', '認證', '地點', '聯絡' ]"
      :title-key="'title'"
      :header-extra="{
        render: (course) => formatItemDate(course),
        tagRender: (course) => course.organization,
        tagClass: 'bg-secondary text-white text-xs px-2 py-1 rounded'
      }"
      :columns="[
        { key: 'organization', label: '認證', render: (course) => course.organization || '-' },
        { key: 'location', label: '地點' },
        { key: 'contact', label: '聯絡' }
      ]"
      empty-message="沒有符合條件的課程"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchCourses } from '../utils/api.js'
import { getLocationOrder, getRegionOrder } from '../utils/location.js'
import { formatItemDate, parseLocalDate } from '../utils/format.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'


const courses = ref([])
const locations = ref([])
const organizations = ref([])
const search = ref('')
const selectedLocation = ref('')
const selectedOrganization = ref('')
const selectedLevel = ref('')

const parseDate = parseLocalDate

const filteredCourses = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return courses.value.filter(course => {
    const endDate = parseDate(course.endDate)
    endDate.setHours(0, 0, 0, 0)
    
    // 只顯示尚未結束的課程（結束日期 >= 今天）
    if (endDate < today) return false
    
    const matchSearch = search.value === '' || 
      course.title.includes(search.value) || 
      course.location.includes(search.value)
    const matchLocation = selectedLocation.value === '' || course.location === selectedLocation.value
    const matchOrganization = selectedOrganization.value === '' || course.organization === selectedOrganization.value
    
    // 從標題提取課程編號
    const courseCode = getCourseCode(course.title)
    const matchLevel = selectedLevel.value === '' || courseCode === selectedLevel.value
    
    return matchSearch && matchLocation && matchOrganization && matchLevel
  }).sort((a, b) => {
    // 先按地區排序（北台灣 → 東台灣 → 中台灣 → 南台灣）
    const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
    if (regionDiff !== 0) return regionDiff
    
    // 再按地點排序（由北到南）
    const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
    if (locationDiff !== 0) return locationDiff
    
    // 最後按日期排序
    return parseDate(a.startDate) - parseDate(b.startDate)
  })
})

// 從課程標題提取課程編號
const getCourseCode = (title) => {
  if (!title) return ''
  const match = title.match(/ASA \d{3}|ASA\s*\d{3}|IYT \d{3}|ASA \d{2}|ASA\s*\d{2}/i)
  return match ? match[0].toUpperCase() : ''
}

// 清除篩選的輔助函式
const clearLocationFilter = () => { selectedLocation.value = '' }
const clearOrganizationFilter = () => { selectedOrganization.value = ''; selectedLevel.value = '' }
const clearLevelFilter = () => { selectedLevel.value = '' }

// 根據當前篩選條件，顯示該組織實際有開過的課程編號
const currentCourseCodes = computed(() => {
  if (!selectedOrganization.value) return []
  
  const orgCourses = courses.value.filter(course => {
    if (course.organization !== selectedOrganization.value) return false
    
    // 根據其他篩選條件過濾
    if (selectedLocation.value && course.location !== selectedLocation.value) return false
    if (search.value && !course.title.includes(search.value) && !course.location.includes(search.value)) return false
    
    return true
  })
  
  const codeSet = new Set()
  orgCourses.forEach(course => {
    const courseCode = getCourseCode(course.title)
    if (courseCode) {
      codeSet.add(courseCode)
    }
  })
  
  return Array.from(codeSet).sort()
})

onMounted(async () => {
  const coursesData = await fetchCourses()
  
  courses.value = coursesData.courses
  
  // 動態提取所有獨特縣市和認證組織
  const locationSet = new Set()
  const organizationSet = new Set()
  
  courses.value.forEach(course => {
    if (course.location) locationSet.add(course.location)
    if (course.organization) organizationSet.add(course.organization)
  })
  
  locations.value = Array.from(locationSet).sort((a, b) => getLocationOrder(a) - getLocationOrder(b))
  organizations.value = Array.from(organizationSet).sort()
})
</script>
