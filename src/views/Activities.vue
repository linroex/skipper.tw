<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船活動列表</h1>

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

      <!-- 第二列：活動類型篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearTypeFilter"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              !selectedType ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            全部類型
          </button>
          <button
            v-for="type in types"
            :key="type.id"
            @click="selectedType = type.id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedType === type.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ type.name }}
          </button>
        </div>
      </div>

      <!-- 搜尋框 -->
      <div>
        <input
          v-model="search"
          type="text"
          placeholder="搜尋活動名稱或地點..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchActivities, fetchTypes } from '../utils/api.js'
import { getLocationOrder, getRegionOrder } from '../utils/location.js'
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
const clearLocationFilter = () => { selectedLocation.value = '' }
const clearTypeFilter = () => { selectedType.value = '' }

onMounted(async () => {
  const activitiesData = await fetchActivities()
  const typesData = await fetchTypes()
  
  activities.value = activitiesData.activities
  types.value = typesData.types
  
  // 動態提取所有獨特縣市
  const locationSet = new Set()
  activities.value.forEach(activity => {
    if (activity.location) locationSet.add(activity.location)
  })
  locations.value = Array.from(locationSet)
})
</script>
