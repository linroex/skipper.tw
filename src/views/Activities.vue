<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船活動列表</h1>

    <!-- 篩選區 -->
    <div class="mb-4 flex flex-col md:flex-row gap-4">
      <input
        v-model="search"
        type="text"
        placeholder="搜尋活動..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
      />
      <select v-model="selectedLocation" class="px-4 py-2 border border-gray-300 rounded-lg">
        <option value="">所有地點</option>
        <option v-for="location in locations" :key="location" :value="location">{{ location }}</option>
      </select>
      <select v-model="selectedType" class="px-4 py-2 border border-gray-300 rounded-lg">
        <option value="">所有類型</option>
        <option v-for="type in types" :key="type.id" :value="type.id">{{ type.name }}</option>
      </select>
    </div>

    <!-- 簡單列表 -->
    <ResponsiveTable
      :items="filteredActivities"
      :headers="[ '日期', '活動名稱', '地點', '主辦', '價格', '聯絡' ]"
      :title-key="'title'"
      :header-extra="{
        render: (activity) => formatDateRange(activity.startDate, activity.endDate),
        tagRender: getType(activity.type),
        tagClass: 'bg-primary text-white text-xs px-2 py-1 rounded'
      }"
      :columns="[
        { key: 'location', label: '地點' },
        { key: 'unit', label: '主辦' },
        { key: 'price', label: '價格', render: (activity) => formatPrice(activity.price) },
        { key: 'contact', label: '聯絡' }
      ]"
      empty-message="沒有符合條件的活動"
    />

    <div v-if="filteredActivities.length === 0" class="text-center py-12 text-gray-500">
      沒有符合條件的活動
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchActivities, fetchTypes } from '../utils/api.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'

const activities = ref([])
const locations = ref([])
const types = ref([])
const search = ref('')
const selectedLocation = ref('')
const selectedType = ref('')

const parseDate = (date) => new Date(`${date}T00:00:00`)

const filteredActivities = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return activities.value.filter(activity => {
    const endDate = parseDate(activity.endDate)
    endDate.setHours(0, 0, 0, 0)
    
    // 只顯示尚未結束的活動（結束日期 >= 今天）
    if (endDate < today) return false
    
    const matchSearch = search.value === '' || 
      activity.title.includes(search.value) || 
      activity.location.includes(search.value)
    const matchLocation = selectedLocation.value === '' || activity.location === selectedLocation.value
    const matchType = selectedType.value === '' || activity.type === selectedType.value
    return matchSearch && matchLocation && matchType
  }).sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate))
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
  const activitiesData = await fetchActivities()
  const typesData = await fetchTypes()
  
  activities.value = activitiesData.activities
  types.value = typesData.types
  
  // 動態提取所有獨特地點
  const locationSet = new Set()
  activities.value.forEach(activity => {
    if (activity.location) locationSet.add(activity.location)
  })
  locations.value = Array.from(locationSet)
})
</script>
