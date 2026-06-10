<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船課程列表</h1>

    <!-- 篩選區 -->
    <div class="mb-4 flex flex-col md:flex-row gap-4">
      <input
        v-model="search"
        type="text"
        placeholder="搜尋課程..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
      />
      <select v-model="selectedLocation" class="px-4 py-2 border border-gray-300 rounded-lg">
        <option value="">所有地點</option>
        <option v-for="location in locations" :key="location" :value="location">{{ location }}</option>
      </select>

    </div>

    <!-- 簡單列表 -->
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
      empty-message="沒有符合條件的課程"
    />

    <div v-if="filteredCourses.length === 0" class="text-center py-12 text-gray-500">
      沒有符合條件的課程
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchCourses } from '../utils/api.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'


const courses = ref([])
const locations = ref([])
const search = ref('')
const selectedLocation = ref('')
const selectedLevel = ref('')

const parseDate = (date) => new Date(`${date}T00:00:00`)

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
    return matchSearch && matchLocation
  }).sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate))
})

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
  
  courses.value = coursesData.courses
  
  // 動態提取所有獨特地點
  const locationSet = new Set()
  courses.value.forEach(course => {
    if (course.location) locationSet.add(course.location)
  })
  locations.value = Array.from(locationSet)
})
</script>
