<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">帆船活動列表</h1>

    <!-- 篩選區 -->
    <div class="mb-6 space-y-2">
      <!-- 地區 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="selectedRegion = ''"
            :class="pillClass(!selectedRegion, 'secondary')"
          >全部地區</button>
          <button
            v-for="region in regions"
            :key="region"
            @click="selectedRegion = region"
            :class="pillClass(selectedRegion === region, 'secondary')"
          >{{ region }}</button>
        </div>
      </div>

      <!-- 類型 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="selectedType = ''"
            :class="pillClass(!selectedType, 'primary')"
          >全部類型</button>
          <button
            v-for="type in types"
            :key="type.id"
            @click="selectedType = type.id"
            :class="pillClass(selectedType === type.id, 'primary')"
          >{{ type.name }}</button>
        </div>
      </div>

      <!-- 參加對象 + 過去活動 -->
      <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-1">
        <div class="flex gap-2 inline-flex">
          <button
            @click="selectedAudience = ''"
            :class="pillClass(!selectedAudience, 'accent')"
          >全部對象</button>
          <button
            @click="selectedAudience = 'public'"
            :class="pillClass(selectedAudience === 'public', 'accent')"
          >對外開放</button>
          <button
            @click="selectedAudience = 'members'"
            :class="pillClass(selectedAudience === 'members', 'accent')"
          >學員專屬</button>
          <button
            @click="showPast = !showPast"
            :class="pillClass(showPast, 'gray')"
          >{{ showPast ? '含過去活動' : '顯示過去' }}</button>
        </div>
      </div>

      <!-- 主辦單位 + 搜尋 -->
      <div class="flex flex-col sm:flex-row gap-2">
        <select
          v-model="selectedUnit"
          class="sm:w-56 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-gray-700"
        >
          <option value="">全部主辦單位</option>
          <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
        </select>
        <input
          v-model="search"
          type="text"
          placeholder="搜尋活動名稱或地點..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>
    </div>

    <!-- 近期活動（固定日期 / 多梯次） -->
    <section v-if="scheduledActivities.length" class="mb-10">
      <h2 class="text-xl font-bold text-gray-800 mb-4">📅 近期活動</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActivityCard
          v-for="activity in scheduledActivities"
          :key="activity.id"
          :activity="activity"
          :school-route="getSchoolRoute(activity.unit)"
          :class="{ 'opacity-60': isPastActivity(activity) }"
        />
      </div>
    </section>

    <!-- 隨時揪團成行（彈性日期） -->
    <section v-if="flexibleActivities.length" class="mb-10">
      <h2 class="text-xl font-bold text-gray-800 mb-1">⛵ 隨時揪團成行</h2>
      <p class="text-sm text-gray-500 mb-4">沒有固定日期，揪到足夠人數即可出發，歡迎直接私訊主辦單位。</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActivityCard
          v-for="activity in flexibleActivities"
          :key="activity.id"
          :activity="activity"
          :school-route="getSchoolRoute(activity.unit)"
        />
      </div>
    </section>

    <div v-if="!scheduledActivities.length && !flexibleActivities.length" class="text-center py-12 text-gray-500">
      沒有符合條件的活動
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { getActivities, getTypes, getSchools } from '../utils/data.js'
import { getLocationOrder, getRegionOrder, regionOrder } from '../utils/location.js'
import {
  isFlexible,
  isPastActivity,
  isUpcomingActivity,
  getActivityStartDate
} from '../utils/activity.js'
import ActivityCard from '../components/ActivityCard.vue'

useHead({
  title: '帆船活動列表 - skipper.tw',
  meta: [
    { name: 'description', content: '查找台灣各地帆船航行、體驗、競賽、揪團成行等活動。可依地區、類型、參加對象與主辦單位篩選。' }
  ]
})

const activities = ref(getActivities())
const types = ref(getTypes())
const schools = ref(getSchools())

const search = ref('')
const selectedRegion = ref('')
const selectedType = ref('')
const selectedAudience = ref('')
const selectedUnit = ref('')
const showPast = ref(false)

const schoolByUnit = computed(() => {
  const map = new Map()
  schools.value.forEach(school => map.set(school.name, school))
  return map
})

const getSchoolRoute = (unit) => {
  const school = schoolByUnit.value.get(unit)
  return school ? { name: 'School', params: { id: school.id } } : null
}

const regions = computed(() => {
  const present = new Set(activities.value.map(a => a.region).filter(Boolean))
  return regionOrder.filter(region => present.has(region))
})

const units = computed(() => {
  const set = new Set(activities.value.map(a => a.unit).filter(Boolean))
  return Array.from(set)
})

const pillClass = (active, color) => {
  const colorMap = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    accent: 'bg-accent text-white',
    gray: 'bg-gray-700 text-white'
  }
  return [
    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
    active ? colorMap[color] : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  ]
}

const matchesFilters = (activity) => {
  const matchSearch = search.value === '' ||
    activity.title.includes(search.value) ||
    (activity.location || '').includes(search.value)
  const matchRegion = !selectedRegion.value || activity.region === selectedRegion.value
  const matchType = !selectedType.value || activity.type === selectedType.value
  const matchAudience = !selectedAudience.value ||
    (activity.audience || 'public') === selectedAudience.value
  const matchUnit = !selectedUnit.value || activity.unit === selectedUnit.value
  return matchSearch && matchRegion && matchType && matchAudience && matchUnit
}

const sortByRegionLocationDate = (a, b) => {
  const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
  if (regionDiff !== 0) return regionDiff
  const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
  if (locationDiff !== 0) return locationDiff
  return (getActivityStartDate(a) ?? 0) - (getActivityStartDate(b) ?? 0)
}

const filtered = computed(() => activities.value.filter(matchesFilters))

// 固定日期 / 多梯次活動：預設只顯示尚未結束
const scheduledActivities = computed(() =>
  filtered.value
    .filter(a => !isFlexible(a))
    .filter(a => showPast.value || isUpcomingActivity(a))
    .sort(sortByRegionLocationDate)
)

// 揪團成行活動：只要在開放區間內就顯示
const flexibleActivities = computed(() =>
  filtered.value
    .filter(a => isFlexible(a))
    .filter(a => showPast.value || isUpcomingActivity(a))
    .sort(sortByRegionLocationDate)
)
</script>
