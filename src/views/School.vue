<template>
  <div>
    <div v-if="school" class="space-y-6">
      <!-- 學校資訊 -->
      <div class="bg-white rounded-lg border border-line p-6">
        <div class="flex items-center gap-3 mb-4">
          <h1 class="text-2xl font-bold tracking-tight text-ink">{{ school.name }}</h1>
          <span v-if="school.shortName" class="text-sm text-ink-soft bg-paper border border-line px-2 py-1 rounded">
            {{ school.shortName }}
          </span>
          <span v-if="organizerTypeLabel" class="text-sm text-white bg-primary px-2 py-1 rounded">
            {{ organizerTypeLabel }}
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
        <a
          v-if="school.url"
          :href="school.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block mb-4 text-primary hover:underline"
        >
          官方網站 →
        </a>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="cert in school.certs"
            :key="cert"
            class="text-xs bg-paper border border-line text-ink-soft px-2 py-1 rounded"
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
              class="text-xs bg-paper border border-line text-primary px-2 py-1 rounded"
            >
              {{ loc }}
            </span>
          </div>
        </div>
      </div>

      <!-- 課程列表 -->
      <div v-if="school.courses.length > 0 || allSchoolCourses.length > 0">
        <div class="mb-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-ink">相關課程</h2>
            <div class="flex items-center gap-1 bg-white border border-line rounded-lg p-1">
              <button
                @click="setViewMode('list')"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list' ? 'bg-line text-ink' : 'text-ink-faint hover:text-ink'
                ]"
                title="列表模式"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                @click="setViewMode('calendar')"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'calendar' ? 'bg-line text-ink' : 'text-ink-faint hover:text-ink'
                ]"
                title="行事曆模式"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 課程篩選器 -->
          <div class="space-y-3">
            <!-- 第一列：認證類型篩選 -->
            <div class="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
              <div class="flex gap-2 inline-flex">
                <button
                  @click="clearCertFilter"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    !selectedCert ? 'bg-primary text-white border border-transparent' : 'bg-white border border-line text-ink-soft hover:border-ink-faint'
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
                    selectedCert === cert ? 'bg-primary text-white border border-transparent' : 'bg-white border border-line text-ink-soft hover:border-ink-faint'
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
                    !selectedLevel ? 'bg-accent text-white border border-transparent' : 'bg-white border border-line text-ink-soft hover:border-ink-faint'
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
                    selectedLevel === courseCode ? 'bg-accent text-white border border-transparent' : 'bg-white border border-line text-ink-soft hover:border-ink-faint'
                  ]"
                >
                  {{ courseCode }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveTable
          v-if="viewMode === 'list'"
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
          empty-message="暫無相關課程"
        />
        <CourseCalendar
          v-else
          :items="filteredCalendarCourses"
          :get-school-name="getSchoolName"
          :get-school-route="getSchoolRoute"
        />
      </div>

      <!-- 活動列表 -->
      <div v-if="school.activities.length > 0">
        <h2 class="text-xl font-bold text-ink mb-2">相關活動</h2>
        <ul class="list-none m-0 p-0 max-w-2xl">
          <ActivityRow
            v-for="activity in school.activities"
            :key="activity.id"
            :activity="activity"
          />
        </ul>
      </div>

      <!-- 沒有資料 -->
      <div v-if="school.courses.length === 0 && allSchoolCourses.length === 0 && school.activities.length === 0" class="text-center py-12 text-gray-500">
        暫無相關課程或活動
      </div>

      <!-- 返回連結 -->
      <div class="mt-6">
        <router-link to="/schools" class="text-primary hover:underline">
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
import { useHead } from '@unhead/vue'
import { getActivities, getCourses, getSchools } from '../utils/data.js'
import { getLocationOrder, getRegionOrder } from '../utils/location.js'
import { formatItemDate, parseLocalDate } from '../utils/format.js'
import { getOrganizerTypeLabel, isUpcomingActivity, getActivityStartDate } from '../utils/activity.js'
import ResponsiveTable from '../components/ResponsiveTable.vue'
import CourseCalendar from '../components/CourseCalendar.vue'
import ActivityRow from '../components/ActivityRow.vue'


const route = useRoute()
const courses = ref(getCourses())
const activities = ref(getActivities())
const schools = ref(getSchools())
const schoolDataMap = new Map(schools.value.map(schoolInfo => [schoolInfo.id, schoolInfo]))
const selectedCert = ref('')
const selectedLevel = ref('')
const viewMode = ref('list')

const parseDate = parseLocalDate

const schoolByUnit = computed(() => {
  const map = new Map()
  schools.value.forEach(school => map.set(school.name, school))
  return map
})

const getSchool = (unit) => schoolByUnit.value.get(unit)
const getSchoolName = (unit) => getSchool(unit)?.shortName || unit || '-'
const getSchoolRoute = (unit) => {
  const matchedSchool = getSchool(unit)
  return matchedSchool ? { name: 'School', params: { id: matchedSchool.id } } : { name: 'Schools' }
}

const schoolData = computed(() => {
  const schoolId = decodeURIComponent(route.params.id)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 根據學校 ID 找到學校資料
  const schoolInfo = schoolDataMap.get(schoolId)
  if (!schoolInfo) return null
  
  const schoolName = schoolInfo.name
  
  // 過濾並排序課程（只顯示尚未結束的，按地區→地點→日期排序）
  const schoolCourses = courses.value
    .filter(c => c.unit === schoolName) // 只篩選該學校
    .filter(c => {
      const endDate = parseDate(c.endDate)
      endDate.setHours(0, 0, 0, 0)
      return endDate >= today // 只顯示尚未結束的課程
    })
    .sort((a, b) => {
      const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
      if (regionDiff !== 0) return regionDiff
      const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
      if (locationDiff !== 0) return locationDiff
      return parseDate(a.startDate) - parseDate(b.startDate)
    })
  
  // 過濾並排序活動（只顯示尚未結束的，按地區→地點→日期排序）
  const schoolActivities = activities.value
    .filter(a => a.unit === schoolName) // 只篩選該學校
    .filter(isUpcomingActivity) // 只顯示尚未結束的活動（含揪團區間內）
    .sort((a, b) => {
      const regionDiff = getRegionOrder(a.region) - getRegionOrder(b.region)
      if (regionDiff !== 0) return regionDiff
      const locationDiff = getLocationOrder(a.location) - getLocationOrder(b.location)
      if (locationDiff !== 0) return locationDiff
      return (getActivityStartDate(a) ?? 0) - (getActivityStartDate(b) ?? 0)
    })

  const certs = schoolInfo.certs || [...new Set(schoolCourses.map(c => c.organization).filter(Boolean))]
  const locations = schoolInfo.locations || [...new Set(schoolCourses.map(c => c.location).filter(Boolean))]

  return {
    id: schoolId,
    name: schoolName,
    shortName: schoolInfo.shortName,
    type: schoolInfo.type,
    courses: schoolCourses,
    activities: schoolActivities,
    totalCourses: schoolCourses.length,
    totalActivities: schoolActivities.length,
    certs: certs,
    locations: locations,
    url: schoolInfo.url || '',
    description: schoolInfo.description || `${schoolName} - 提供多樣化的帆船課程與活動`
  }
})

const school = computed(() => schoolData.value)

useHead(computed(() => {
  const currentSchool = schoolData.value
  const title = currentSchool
    ? `${currentSchool.name} 帆船課程與活動 - skipper.tw`
    : '帆船學校資料 - skipper.tw'
  const description = currentSchool
    ? `${currentSchool.name} 提供 ${currentSchool.certs.join('、')} 等帆船課程與活動，服務地區包含 ${currentSchool.locations.join('、')}。`
    : '查看台灣帆船學校的課程、活動、認證與服務地區資訊。'

  return {
    title,
    meta: [
      { name: 'description', content: description }
    ]
  }
}))

// 學校的認證列表
const schoolCerts = computed(() => {
  return school.value?.certs || []
})

// 提取課程編號的函式
const getCourseCode = (title) => {
  if (!title) return ''
  const match = title.match(/ASA \d{3}|ASA\s*\d{3}|IYT \d{3}|IYT\s*\d{3}|ASA \d{2}|ASA\s*\d{2}/i)
  return match ? match[0].toUpperCase() : ''
}

const selectedSchoolName = computed(() => school.value?.name || '')

const sortCoursesByDateAndLocation = (items) => {
  return [...items].sort((a, b) => {
    const dateDiff = parseDate(a.startDate) - parseDate(b.startDate)
    if (dateDiff !== 0) return dateDiff
    return getLocationOrder(a.location) - getLocationOrder(b.location)
  })
}

const allSchoolCourses = computed(() => {
  if (!selectedSchoolName.value) return []
  return sortCoursesByDateAndLocation(courses.value.filter(course => course.unit === selectedSchoolName.value))
})

const applyCourseFilters = (items) => {
  let filtered = [...items]

  if (selectedCert.value) {
    filtered = filtered.filter(course => course.organization === selectedCert.value)
  }

  if (selectedLevel.value) {
    filtered = filtered.filter(course => getCourseCode(course.title) === selectedLevel.value)
  }

  return filtered
}

// 為每個認證組織提取課程編號
const getCourseCodesForCert = (cert) => {
  if (!school.value) return []
  
  const certCourses = allSchoolCourses.value.filter(course => {
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

// 篩選後的課程：列表維持只顯示未結束課程；行事曆顯示此學校所有課程（含過去）
const filteredCourses = computed(() => {
  if (!school.value) return []
  return applyCourseFilters(school.value.courses)
})

const filteredCalendarCourses = computed(() => {
  if (!school.value) return []
  return applyCourseFilters(allSchoolCourses.value)
})

const organizerTypeLabel = computed(() => getOrganizerTypeLabel(school.value?.type))

// 清除篩選的輔助函式
const clearCertFilter = () => { selectedCert.value = ''; selectedLevel.value = '' }
const clearLevelFilter = () => { selectedLevel.value = '' }

const setViewMode = (mode) => {
  viewMode.value = mode
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('schoolCoursesViewMode', mode)
  }
}

onMounted(() => {
  const savedViewMode = window.localStorage.getItem('schoolCoursesViewMode')
  if (savedViewMode === 'calendar') {
    viewMode.value = 'calendar'
  }
})
</script>
