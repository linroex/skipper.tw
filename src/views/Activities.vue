<template>
  <div class="max-w-2xl">
    <header class="mb-2">
      <h1 class="text-2xl font-bold tracking-tight">帆船活動</h1>
      <p class="mt-1.5 text-sm text-ink-soft">台灣各地的出航機會。點進去看詳情、直接私訊主辦。</p>
    </header>

    <!-- 近期出航 -->
    <section>
      <h2 class="text-[13px] font-bold uppercase tracking-[1.5px] text-ink-faint mt-8 mb-1">近期出航</h2>
      <ul v-if="upcomingActivities.length" class="list-none m-0 p-0">
        <ActivityRow
          v-for="activity in upcomingActivities"
          :key="activity.id"
          :activity="activity"
        />
      </ul>
      <p v-else class="text-sm text-ink-faint py-6">目前沒有即將出航的活動。</p>
    </section>

    <!-- 揪團成行 -->
    <section>
      <h2 class="text-[13px] font-bold uppercase tracking-[1.5px] text-ink-faint mt-8 mb-1">揪團成行・沒有固定日期</h2>
      <ul v-if="flexibleActivities.length" class="list-none m-0 p-0">
        <ActivityRow
          v-for="activity in flexibleActivities"
          :key="activity.id"
          :activity="activity"
        />
      </ul>
      <p v-else class="text-sm text-ink-faint py-6">目前沒有開放揪團的活動。</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { getActivities } from '../utils/data.js'
import {
  isFlexible,
  isUpcomingActivity,
  getNextDate
} from '../utils/activity.js'
import ActivityRow from '../components/ActivityRow.vue'

useHead({
  title: '帆船活動列表 - skipper.tw',
  meta: [
    { name: 'description', content: '台灣各地帆船活動：近期出航與揪團成行的航行、體驗、競賽資訊，直接聯絡主辦單位報名。' }
  ]
})

const activities = getActivities()

// SSG 會在建置時固化「今天」，掛載後重算一次確保日期分組正確
const now = ref(0)
onMounted(() => { now.value = Date.now() })

// 近期出航：固定日期／多梯次、尚未結束，按下一個日期排序
const upcomingActivities = computed(() => {
  void now.value
  return activities
    .filter(a => !isFlexible(a))
    .filter(isUpcomingActivity)
    .sort((a, b) => (getNextDate(a) ?? 0) - (getNextDate(b) ?? 0))
})

// 揪團成行：開放區間內的彈性活動
const flexibleActivities = computed(() => {
  void now.value
  return activities
    .filter(isFlexible)
    .filter(isUpcomingActivity)
})
</script>
