<template>
  <div class="max-w-2xl mx-auto">
    <header class="mb-5">
      <h1 class="text-2xl font-bold tracking-tight">帆船比賽</h1>
    </header>

    <!-- 年份切換 -->
    <div class="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5" role="tablist" aria-label="年份">
      <button
        v-for="y in years"
        :key="y"
        type="button"
        role="tab"
        :aria-selected="y === year"
        :class="[
          'flex-none rounded-full px-3.5 py-1.5 text-sm font-bold tabular-nums border transition-colors',
          y === year
            ? 'bg-primary text-paper border-primary'
            : 'border-line text-ink-soft hover:text-ink'
        ]"
        @click="selectedYear = y"
      >{{ y }}</button>
    </div>

    <!-- 12 個月總覽 -->
    <ol class="list-none m-0 p-0 mt-4">
      <li
        v-for="m in months"
        :key="m.month"
        :class="['flex gap-3.5 border-b border-line py-3', m.events.length ? '' : 'py-2']"
      >
        <span
          :class="[
            'flex-none w-10 text-sm font-bold tabular-nums leading-snug pt-px',
            m.isCurrent ? 'text-primary' : m.events.length ? 'text-ink' : 'text-ink-faint/60 font-semibold'
          ]"
        >{{ m.month }} 月</span>

        <ul v-if="m.events.length" class="list-none m-0 p-0 min-w-0 flex-1 space-y-2.5">
          <li v-for="ev in m.events" :key="ev.race.id + ev.edition.startDate" :class="ev.past ? 'opacity-55' : ''">
            <router-link :to="`/races/${ev.race.id}`" class="group block">
              <span class="flex items-baseline gap-2">
                <span class="flex-none text-[13px] font-bold tabular-nums text-primary whitespace-nowrap">{{ ev.when }}</span>
                <span class="min-w-0 flex-1 text-[15px] font-bold leading-snug group-hover:text-primary">
                  {{ ev.race.name }}<span v-if="ev.edition.label" class="ml-1.5 text-xs font-medium text-ink-faint">{{ ev.edition.label }}</span>
                </span>
                <span
                  v-if="ev.tag"
                  class="flex-none whitespace-nowrap text-[11px] font-bold text-cond bg-cond-bg rounded px-1.5 py-px"
                >{{ ev.tag }}</span>
              </span>
              <span class="block truncate text-[13px] text-ink-soft mt-0.5">{{ ev.location }}</span>
            </router-link>
          </li>
        </ul>
        <span v-else class="text-[13px] text-ink-faint/60 leading-snug pt-0.5">—</span>
      </li>
    </ol>

    <!-- 今年還沒公布：參考去年 -->
    <section v-if="missing.length" class="mt-8">
      <h2 class="text-[13px] font-bold tracking-[1.5px] text-ink-faint mb-1">{{ year }} 尚未公布・參考去年</h2>
      <ul class="list-none m-0 p-0">
        <li v-for="ev in missing" :key="ev.race.id" class="border-b border-line">
          <router-link :to="`/races/${ev.race.id}`" class="group flex items-baseline gap-3.5 py-3">
            <span class="flex-none w-10 text-sm font-semibold text-ink-faint tabular-nums whitespace-nowrap">{{ ev.when }}</span>
            <span class="min-w-0 flex-1 text-[15px] font-bold leading-snug group-hover:text-primary">{{ ev.race.name }}</span>
          </router-link>
        </li>
      </ul>
    </section>

    <p v-if="!years.length" class="text-sm text-ink-faint py-6">目前沒有收錄的比賽。</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { getRaces } from '../utils/data.js'
import {
  getRaceYears,
  getYearEvents,
  getMissingThisYear,
  formatEditionDate,
  editionEnd,
  editionStart,
  DATE_STATUS_LABELS,
  editionUnits
} from '../utils/race.js'

useHead({
  title: '帆船比賽',
  meta: [
    { name: 'description', content: '台灣與周邊海域每年舉辦的帆船比賽，依月份一次看完全年賽程；歷年日期、地點與各帆船學校的組隊報名資訊，提早規劃參賽。' }
  ]
})

// SSG 會在建置時固化「今天」，掛載後重算一次
const now = ref(0)
onMounted(() => { now.value = Date.now() })
const today = computed(() => {
  const d = now.value ? new Date(now.value) : new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

const races = getRaces()
const thisYear = computed(() => today.value.getFullYear())

// 年份：2025 年起有場次的年份，加上今年（即使還沒有場次）
const FIRST_YEAR = 2025
const years = computed(() => {
  const list = new Set(getRaceYears(races).filter(y => y >= FIRST_YEAR))
  if (list.size) list.add(thisYear.value)
  return [...list].sort((a, b) => b - a)
})

const selectedYear = ref(null)
const year = computed(() => selectedYear.value ?? thisYear.value)

const whenOf = (edition) => formatEditionDate(edition)

const months = computed(() => {
  const events = getYearEvents(races, year.value).map(({ race, edition, month }) => {
    const end = editionEnd(edition)
    const upcoming = end >= today.value
    const status = edition.dateStatus ? DATE_STATUS_LABELS[edition.dateStatus] : ''
    const units = upcoming ? editionUnits(edition).length : 0
    return {
      race,
      edition,
      month,
      when: whenOf(edition),
      location: edition.location || race.location,
      // 只有今年已結束的場次變淡；查看過去年份時全部正常顯示
      past: year.value === thisYear.value && end < today.value,
      // 標籤只留最重要的一個：預計／預定 > 可報名校數
      tag: status && edition.dateStatus === 'tentative' ? status : units ? `${units} 校可報名` : ''
    }
  })
  const currentMonth = year.value === thisYear.value ? today.value.getMonth() + 1 : 0
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    isCurrent: i + 1 === currentMonth,
    events: events.filter(e => e.month === i + 1)
  }))
})

// 只在查看今年（或未來）時顯示「尚未公布」
const missing = computed(() => {
  if (year.value < thisYear.value) return []
  return getMissingThisYear(races, year.value).map(({ race, edition }) => ({
    race,
    when: `${editionStart(edition).getMonth() + 1} 月`
  }))
})
</script>
