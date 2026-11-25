<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="race">
      <header class="mb-2">
        <h1 class="text-2xl font-bold tracking-tight text-balance">{{ race.name }}</h1>
        <p v-if="race.organizer" class="mt-1.5 text-sm text-ink-soft">主辦：{{ race.organizer }}</p>
        <p v-if="race.location" class="text-sm text-ink-soft">{{ race.location }}</p>
        <p v-if="race.description" class="mt-3 text-sm text-ink-soft">{{ race.description }}</p>
        <p v-if="race.website" class="mt-2 text-sm">
          <a :href="race.website" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">官方網站 →</a>
        </p>
      </header>

      <!-- 提早準備的提示：今年還沒有未結束的場次 -->
      <p v-if="hint" class="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-soft">{{ hint }}</p>

      <section v-for="group in yearGroups" :key="group.year">
        <h2 class="text-[13px] font-bold uppercase tracking-[1.5px] text-ink-faint mt-8 mb-1">{{ group.year }}</h2>

        <article v-for="(edition, i) in group.editions" :key="i" class="border-b border-line py-4">
          <div class="flex items-baseline gap-3">
            <span :class="['text-sm font-bold tabular-nums whitespace-nowrap', upcoming(edition) ? 'text-primary' : 'text-ink-faint']">
              {{ formatEditionDate(edition) }}
            </span>
            <span class="min-w-0 flex-1 text-base font-bold leading-snug">
              {{ edition.label || race.name }}
              <span
                v-if="upcoming(edition)"
                class="ml-1.5 align-[1px] inline-block whitespace-nowrap text-[11px] font-bold text-cond bg-cond-bg rounded px-1.5 py-px"
              >即將舉行</span>
              <span
                v-if="statusLabel(edition)"
                class="ml-1.5 align-[1px] inline-block whitespace-nowrap text-[11px] font-bold text-ink-soft border border-line rounded px-1.5 py-px"
              >{{ statusLabel(edition) }}</span>
            </span>
          </div>

          <p v-if="edition.location && edition.location !== race.location" class="mt-0.5 text-[13px] text-ink-soft">{{ edition.location }}</p>
          <p v-if="edition.note" class="mt-0.5 text-[13px] text-ink-soft">{{ edition.note }}</p>

          <p v-if="edition.url || (edition.links && edition.links.length)" class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px]">
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

          <!-- 官方報名資訊（不屬於任何學校） -->
          <div v-if="edition.registration" class="mt-3 rounded-lg border border-line bg-surface px-3.5 py-3">
            <p class="text-[13px] font-bold text-ink-faint">官方報名</p>
            <p v-if="edition.registration.deadline" class="mt-1 text-[13px] text-ink-soft">報名截止 {{ MD(edition.registration.deadline) }}</p>
            <p v-if="edition.registration.feeText" class="mt-0.5 text-[13px] text-ink-soft">{{ edition.registration.feeText }}</p>
            <p v-if="edition.registration.note" class="mt-0.5 text-[13px] text-ink-soft">{{ edition.registration.note }}</p>
            <p v-if="edition.registration.url" class="mt-1 text-[13px]">
              <a :href="edition.registration.url" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">競賽規程／報名 →</a>
            </p>
          </div>

          <!-- 各校報名資訊 -->
          <ul v-if="edition.entries && edition.entries.length" class="list-none m-0 mt-3 p-0 space-y-2.5">
            <li v-for="(entry, j) in edition.entries" :key="j" class="rounded-lg border border-line bg-surface px-3.5 py-3">
              <div class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 text-[15px] font-bold leading-snug">
                  <router-link v-if="schoolId(entry.unit)" :to="`/schools/${schoolId(entry.unit)}`" class="hover:text-primary">{{ entry.unit }}</router-link>
                  <template v-else>{{ entry.unit }}</template>
                  <span
                    v-if="entry.role"
                    class="ml-1.5 align-[1px] inline-block whitespace-nowrap text-[11px] font-bold text-cond bg-cond-bg rounded px-1.5 py-px"
                  >{{ entry.role }}</span>
                </span>
                <span v-if="priceText(entry)" class="flex-none text-right text-[13px] font-bold leading-snug">{{ priceText(entry) }}</span>
              </div>
              <p v-if="metaText(entry)" class="mt-1 text-[13px] text-ink-soft">{{ metaText(entry) }}</p>
              <p v-if="entry.note" class="mt-0.5 text-[13px] text-ink-soft">{{ entry.note }}</p>
              <p v-if="entry.contact || entry.url" class="mt-1 text-[13px] text-ink-soft">
                <template v-if="entry.contact"><LinkText :text="entry.contact" /></template>
                <a v-if="entry.url" :href="entry.url" target="_blank" rel="noopener noreferrer" class="ml-3 text-primary hover:underline">貼文 →</a>
              </p>
            </li>
          </ul>
          <p v-else-if="upcoming(edition) && !edition.registration" class="mt-2 text-[13px] text-ink-faint">尚未收錄各校的報名資訊。</p>
        </article>
      </section>

      <p v-if="hasStatus" class="mt-6 text-[13px] text-ink-faint">
        「預定日期」是協會年初行事曆排定的日期，實際可能略有不同；「預計」代表還沒有官方公告。
      </p>

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
  groupEditionsByYear,
  formatEditionDate,
  isUpcomingEdition,
  editionStart,
  editionYear
} from '../utils/race.js'
import LinkText from '../components/LinkText.vue'

const route = useRoute()
const race = computed(() => getRaceById(route.params.id))

// SSG 會在建置時固化「今天」，掛載後重算一次
const now = ref(0)
onMounted(() => { now.value = Date.now() })
const upcoming = (edition) => { void now.value; return isUpcomingEdition(edition) }

const statusLabel = (edition) => DATE_STATUS_LABELS[edition.dateStatus] || ''
const hasStatus = computed(() => !!race.value && race.value.editions.some(e => e.dateStatus))

const yearGroups = computed(() => (race.value ? groupEditionsByYear(race.value) : []))

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

// 今年還沒有未結束的場次時，提示去年的時間，方便提早準備
const hint = computed(() => {
  void now.value
  if (!race.value) return ''
  const editions = sortEditions(race.value)
  if (!editions.length || editions.some(isUpcomingEdition)) return ''
  const latest = editions[editions.length - 1]
  const start = editionStart(latest)
  const thisYear = new Date().getFullYear()
  const when = formatEditionDate(latest)
  if (editionYear(latest) === thisYear) {
    return `今年已舉辦（${when}），明年尚未公布。可以參考今年的時間，提早關注各校的報名公告。`
  }
  return `今年尚未公布。最近一次是 ${editionYear(latest)} 年 ${when}，可以參考這段時間，提早關注各校的報名公告。`
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
