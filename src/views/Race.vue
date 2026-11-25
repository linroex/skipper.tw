<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="race">
      <header>
        <h1 class="text-2xl font-bold tracking-tight text-balance">{{ race.name }}</h1>
        <p v-if="metaLine" class="mt-1.5 text-sm text-ink-soft">{{ metaLine }}</p>
        <p v-if="race.description" class="mt-2 text-sm text-ink-soft">{{ race.description }}</p>
        <p v-if="race.website" class="mt-2 text-sm">
          <a :href="race.website" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">官方網站 →</a>
        </p>
        <p v-if="hint" class="mt-3 text-[13px] text-ink-faint">{{ hint }}</p>
      </header>

      <!-- 即將舉行：報名需要的資訊 -->
      <section v-for="(edition, i) in upcomingEditions" :key="'u' + i">
        <h2 class="text-[13px] font-bold tracking-[1.5px] text-ink-faint mt-8 mb-1">即將舉行</h2>
        <div class="border-b border-line pb-4">
          <p class="flex items-baseline gap-2 text-base font-bold leading-snug">
            <span class="text-primary tabular-nums whitespace-nowrap">{{ editionDate(edition) }}</span>
            <span class="min-w-0">{{ edition.label || race.name }}</span>
            <span
              v-if="statusLabel(edition)"
              class="flex-none whitespace-nowrap text-[11px] font-bold text-cond bg-cond-bg rounded px-1.5 py-px"
            >{{ statusLabel(edition) }}</span>
          </p>
          <p v-if="edition.location && edition.location !== race.location" class="mt-0.5 text-[13px] text-ink-soft">{{ edition.location }}</p>
          <p v-if="edition.note" class="mt-0.5 text-[13px] text-ink-soft">{{ edition.note }}</p>

          <!-- 官方報名 -->
          <p v-if="registrationText(edition)" class="mt-2 text-[13px] text-ink-soft">
            <span class="font-bold text-ink">官方報名</span>　{{ registrationText(edition) }}
          </p>

          <p class="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px]">
            <a v-if="edition.registration && edition.registration.url" :href="edition.registration.url" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">競賽規程／報名 →</a>
            <a v-if="edition.url" :href="edition.url" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">來源 →</a>
            <a
              v-for="link in edition.links || []"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:underline"
            >{{ link.label }} →</a>
          </p>

          <!-- 各校報名 -->
          <ul v-if="edition.entries && edition.entries.length" class="list-none m-0 mt-3 p-0">
            <li v-for="(entry, j) in edition.entries" :key="j" class="border-t border-line py-2.5">
              <div class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 text-[15px] font-bold leading-snug">
                  <router-link v-if="schoolId(entry.unit)" :to="`/schools/${schoolId(entry.unit)}`" class="hover:text-primary">{{ entry.unit }}</router-link>
                  <template v-else>{{ entry.unit }}</template>
                  <span v-if="entry.role" class="ml-1.5 text-xs font-medium text-ink-faint">{{ entry.role }}</span>
                </span>
                <span v-if="priceText(entry)" class="flex-none text-right text-[13px] font-bold leading-snug">{{ priceText(entry) }}</span>
              </div>
              <p v-if="metaText(entry)" class="mt-0.5 text-[13px] text-ink-soft">{{ metaText(entry) }}</p>
              <p v-if="entry.note" class="mt-0.5 text-[13px] text-ink-soft">{{ entry.note }}</p>
              <p v-if="entry.contact || entry.url" class="mt-0.5 text-[13px] text-ink-soft">
                <template v-if="entry.contact"><LinkText :text="entry.contact" /></template>
                <a v-if="entry.url" :href="entry.url" target="_blank" rel="noopener noreferrer" class="ml-3 text-primary hover:underline">貼文 →</a>
              </p>
            </li>
          </ul>
        </div>
      </section>

      <!-- 歷年場次：每場一行 -->
      <section v-if="pastEditions.length">
        <h2 class="text-[13px] font-bold tracking-[1.5px] text-ink-faint mt-8 mb-1">歷年場次</h2>
        <ul class="list-none m-0 p-0">
          <li v-for="(edition, i) in pastEditions" :key="i" class="border-b border-line py-3">
            <div class="flex items-baseline gap-3">
              <span class="flex-none text-sm font-bold tabular-nums text-ink-soft whitespace-nowrap">
                {{ editionYear(edition) }} {{ editionDate(edition) }}
              </span>
              <span class="min-w-0 flex-1 text-[15px] font-semibold leading-snug">
                {{ edition.label || '' }}
                <span
                  v-if="statusLabel(edition)"
                  class="ml-1 text-[11px] font-bold text-ink-faint border border-line rounded px-1.5 py-px"
                >{{ statusLabel(edition) }}</span>
              </span>
              <a v-if="edition.url" :href="edition.url" target="_blank" rel="noopener noreferrer" class="flex-none text-[13px] text-primary hover:underline">來源 →</a>
            </div>
            <p v-if="pastDetail(edition)" class="mt-0.5 text-[13px] text-ink-soft">{{ pastDetail(edition) }}</p>
          </li>
        </ul>
      </section>

      <div class="mt-8">
        <router-link to="/races" class="text-primary hover:underline">← 返回比賽列表</router-link>
      </div>
    </div>

    <div v-else class="text-center py-12 text-ink-faint">
      找不到這個比賽。
      <div class="mt-4"><router-link to="/races" class="text-primary hover:underline">← 返回比賽列表</router-link></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { getRaceById, getSchools } from '../utils/data.js'
import { getPriceParts } from '../utils/activity.js'
import {
  DATE_STATUS_LABELS,
  sortEditions,
  formatEditionDate,
  isUpcomingEdition,
  editionYear
} from '../utils/race.js'
import LinkText from '../components/LinkText.vue'

const route = useRoute()
const race = computed(() => getRaceById(route.params.id))

// SSG 會在建置時固化「今天」，掛載後重算一次
const now = ref(0)
onMounted(() => { now.value = Date.now() })

const statusLabel = (edition) => DATE_STATUS_LABELS[edition.dateStatus] || ''
const editionDate = formatEditionDate

const metaLine = computed(() =>
  [race.value?.location, race.value?.organizer && `主辦：${race.value.organizer}`].filter(Boolean).join('・')
)

// 未結束的場次（由近到遠）／已結束的場次（由新到舊）
const upcomingEditions = computed(() => {
  void now.value
  return race.value ? sortEditions(race.value).filter(isUpcomingEdition) : []
})
const pastEditions = computed(() => {
  void now.value
  return race.value ? sortEditions(race.value).filter(e => !isUpcomingEdition(e)).reverse() : []
})

// 官方報名：截止日、費用、備註合成一行
const registrationText = (edition) => {
  const r = edition.registration
  if (!r) return ''
  return [r.deadline && `截止 ${MD(r.deadline)}`, r.feeText, r.note].filter(Boolean).join('・')
}

// 過去場次的補充：不同的地點、備註、參加的學校
const pastDetail = (edition) => {
  const units = [...new Set((edition.entries || []).map(e => e.unit).filter(Boolean))]
  return [
    edition.location && edition.location !== race.value.location ? edition.location : '',
    edition.note,
    units.length ? `參加：${units.join('、')}` : ''
  ].filter(Boolean).join('・')
}

const schoolByName = computed(() => new Map(getSchools().map(s => [s.name, s.id])))
const schoolId = (unit) => schoolByName.value.get(unit)

const priceText = (entry) => {
  const { main, note } = getPriceParts(entry, '會員')
  if (!main) return ''
  return note ? `${main}・${note}` : main
}

const MD = (iso) => {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}
const metaText = (entry) => {
  const parts = []
  if (entry.deadline) parts.push(`報名截止 ${MD(entry.deadline)}`)
  if (entry.capacity) parts.push(`名額 ${entry.capacity}`)
  if (entry.requirements) parts.push(entry.requirements)
  return parts.join('・')
}

// 還沒有未結束的場次時，用一行提示最近一次的時間，方便提早準備
const hint = computed(() => {
  if (!race.value || upcomingEditions.value.length) return ''
  const latest = pastEditions.value[0]
  if (!latest) return ''
  return `目前尚未公布下一場。最近一次是 ${editionYear(latest)} 年 ${formatEditionDate(latest)}，可以提早關注。`
})

useHead(computed(() => {
  const r = race.value
  return {
    title: r ? `${r.name}｜帆船比賽` : '帆船比賽',
    meta: [
      {
        name: 'description',
        content: r
          ? `${r.name}：歷年日期、地點${r.organizer ? '、主辦單位' : ''}，以及各帆船學校的組隊與報名資訊。${r.description || ''}`
          : '台灣與周邊海域每年舉辦的帆船比賽。'
      }
    ]
  }
}))
</script>
