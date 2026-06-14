<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船活動列表</h1>

    <!-- 篩選區 - 多列按鈕 -->
    <div class="mb-4 space-y-2">
      <!-- 第一列：縣市篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearLocationFilter"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
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
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedLocation === location ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ location }}
          </button>
          <button
            @click="showPastActivities = !showPastActivities"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showPastActivities ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ showPastActivities ? '含過去活動' : '顯示過去' }}
          </button>
        </div>
      </div>

      <!-- 第二列：活動類型篩選 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="clearTypeFilter"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
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
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
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
      :headers="[ '日期', '活動名稱', '地點', '主辦', '聯絡' ]"
      :title-key="'title'"
      :header-extra="{
        render: (activity) => formatItemDate(activity),
        tagRender: (activity) => getType(activity.type),
        tagClass: 'bg-primary text-white text-xs px-2 py-1 rounded'
      }"
      :columns="[
        { key: 'location', label: '地點' },
        { key: 'unit', label: '主辦' },
        { key: 'contact', label: '聯絡' }
      ]"
      empty-message="沒有符合條件的活動"
      :row-class="getActivityRowClass"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHead } from '@unhead/vue'

// SEO meta tags
useHead({
  title: '帆船活動列表 - skipper.tw',
  meta: [
    { name: 'description', content: '查找台灣各地帆船體驗課程、競賽、營隊、講座等活動資訊。可依照地區、類型篩選。' }
  ]
})
import { getActivities, getTypes } from '../utils/data.js'
import { getLocationOrder, getRegionOrder } from '../utils/location.js'
import { formatItemDate, parseLocalDate } from '../utils/format.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'

const activities = ref(getActivities())
const types = ref(getTypes())
const search = ref('')
const selectedLocation = ref('')
const selectedType = ref('')
const showPastActivities = ref(false)

const parseDate = parseLocalDate

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const getActivityEndDate = (activity) => {
  const endDate = parseDate(activity.endDate || activity.date)
  if (!endDate) return null
  endDate.setHours(0, 0, 0, 0)
  return endDate
}

const isUpcomingActivity = (activity) => {
  const endDate = getActivityEndDate(activity)
  if (!endDate) return false
  return endDate >= getToday()
}

const isPastActivity = (activity) => {
  const endDate = getActivityEndDate(activity)
  if (!endDate) return false
  return endDate < getToday()
}

const getActivityRowClass = (activity) => isPastActivity(activity) ? 'opacity-60' : ''

const locations = computed(() => {
  const locationSet = new Set()
  activities.value.forEach(activity => {
    if (activity.location) locationSet.add(activity.location)
  })
  return Array.from(locationSet).sort((a, b) => getLocationOrder(a) - getLocationOrder(b))
})

const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    // 預設只顯示尚未結束的活動；開啟後包含過去活動
    if (!showPastActivities.value && !isUpcomingActivity(activity)) return false
    
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

// 清除篩選的輔助函式
const clearLocationFilter = () => { selectedLocation.value = '' }
const clearTypeFilter = () => { selectedType.value = '' }

</script>
