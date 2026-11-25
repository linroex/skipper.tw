<template>
  <div class="max-w-2xl mx-auto">
    <header class="mb-2">
      <h1 class="text-2xl font-bold tracking-tight">帆船比賽</h1>
      <p class="mt-1.5 text-sm text-ink-soft">
        許多比賽每年都會舉辦。先看看去年什麼時候、在哪裡、哪些學校可以報名，提早準備。
      </p>
    </header>

    <section v-for="group in groups" :key="group.key">
      <h2 class="text-[13px] font-bold uppercase tracking-[1.5px] text-ink-faint mt-8 mb-1">{{ group.title }}</h2>
      <ul class="list-none m-0 p-0">
        <li v-for="item in group.items" :key="item.race.id" class="border-b border-line">
          <router-link
            :to="`/races/${item.race.id}`"
            class="group flex items-baseline gap-3.5 py-4 px-0.5"
          >
            <span
              :class="[
                'flex-none w-[76px] max-sm:w-[60px] text-sm max-sm:text-[13px] font-bold whitespace-nowrap tabular-nums',
                group.key === 'upcoming' ? 'text-primary' : 'text-ink-faint font-semibold'
              ]"
            >{{ item.when }}</span>

            <span class="min-w-0 flex-1">
              <span class="block text-balance text-base max-sm:text-[15px] font-bold leading-snug group-hover:text-primary">
                {{ item.race.name }}<span
                  v-if="item.tentative"
                  class="ml-2 align-[1px] inline-block whitespace-nowrap text-[11px] font-bold text-cond bg-cond-bg rounded px-1.5 py-px"
                >預計</span>
              </span>
              <span class="block line-clamp-2 text-[13px] text-ink-soft mt-0.5">{{ subText(item.race) }}</span>
              <span class="block text-[13px] text-ink-faint mt-0.5">{{ item.years }}</span>
            </span>

            <span
              v-if="item.unitCount > 0"
              class="flex-none self-center text-right text-xs font-bold leading-snug"
            >{{ item.unitCount }} 校{{ item.unitLabel }}</span>
          </router-link>
        </li>
      </ul>
    </section>

    <p v-if="!groups.length" class="text-sm text-ink-faint py-6">目前沒有收錄的比賽。</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { getRaces } from '../utils/data.js'
import { summarizeRace } from '../utils/race.js'

useHead({
  title: '帆船比賽',
  meta: [
    { name: 'description', content: '台灣與周邊海域每年舉辦的帆船比賽：歷年日期、地點、主辦單位，以及各帆船學校的組隊與報名資訊，提早規劃參賽。' }
  ]
})

// SSG 會在建置時固化「今天」，掛載後重算一次確保分組正確
const now = ref(0)
onMounted(() => { now.value = Date.now() })

const GROUPS = [
  { key: 'upcoming', title: '即將舉行' },
  { key: 'thisYear', title: '今年已舉辦・明年可以提前準備' },
  { key: 'earlier', title: '今年尚未公布・可參考去年時間' }
]

const groups = computed(() => {
  void now.value
  const summaries = getRaces().map(summarizeRace)
  return GROUPS
    .map(g => ({
      ...g,
      items: summaries
        .filter(s => s.group === g.key)
        .sort((a, b) => g.key === 'upcoming' ? a.sortNext - b.sortNext : a.sortMonth - b.sortMonth)
    }))
    .filter(g => g.items.length)
})

const subText = (race) => [race.location, race.organizer].filter(Boolean).join('・')
</script>
