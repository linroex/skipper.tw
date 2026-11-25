<template>
  <div class="max-w-2xl mx-auto">
    <header class="mb-2">
      <h1 class="text-2xl font-bold tracking-tight">帆船練習</h1>
      <p class="mt-1.5 text-sm text-ink-soft">
        上完課之後，想繼續練習可以去哪裡？依碼頭列出各家的練習與包船方案，先看地點，再比較費用與時間。
      </p>
    </header>

    <!-- 縣市篩選 -->
    <div v-if="cityGroups.length > 1" class="mt-5 flex flex-wrap gap-2">
      <button
        v-for="option in cityOptions"
        :key="option.value"
        @click="selectedCity = option.value"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          selectedCity === option.value ? 'bg-primary text-paper border border-transparent' : 'bg-surface border border-line text-ink-soft hover:border-ink-faint'
        ]"
      >{{ option.label }}</button>
    </div>

    <section v-for="group in visibleGroups" :key="group.city">
      <h2 class="text-[13px] font-bold uppercase tracking-[1.5px] text-ink-faint mt-8 mb-1">{{ group.city }}</h2>

      <article v-for="item in group.places" :key="item.place.id" :id="item.place.id" class="mt-4">
        <div class="flex items-baseline justify-between gap-3">
          <h3 class="text-lg font-bold leading-snug">{{ item.place.name }}</h3>
          <a
            :href="mapUrl(item.place)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-none text-[13px] text-primary hover:underline"
          >地圖 →</a>
        </div>
        <p class="text-[13px] text-ink-faint">{{ item.place.address }}</p>

        <ul class="list-none m-0 mt-2 p-0 space-y-2.5">
          <li
            v-for="offering in item.offerings"
            :key="offering.id"
            class="rounded-lg border border-line bg-surface px-3.5 py-3"
          >
            <div class="flex items-baseline justify-between gap-3">
              <span class="min-w-0 text-[15px] font-bold leading-snug">
                {{ offering.title }}
                <span class="ml-1.5 align-[1px] inline-block whitespace-nowrap text-[11px] font-bold text-cond bg-cond-bg rounded px-1.5 py-px">{{ offering.kind }}</span>
              </span>
              <span v-if="priceText(offering)" class="flex-none text-right text-[13px] font-bold leading-snug">{{ priceText(offering) }}</span>
            </div>

            <p class="mt-1 text-[13px] text-ink-soft">
              <router-link v-if="schoolId(offering.unit)" :to="`/schools/${schoolId(offering.unit)}`" class="hover:text-primary">{{ offering.unit }}</router-link>
              <template v-else>{{ offering.unit }}</template>
              <template v-if="detailText(offering)">・{{ detailText(offering) }}</template>
            </p>
            <p v-if="perPerson(offering)" class="mt-0.5 text-[13px] text-ink-faint">{{ perPerson(offering) }}</p>
            <p v-if="offering.topics && offering.topics.length" class="mt-1 text-[13px] text-ink-soft">練習內容：{{ offering.topics.join('、') }}</p>
            <p v-if="offering.note" class="mt-0.5 text-[13px] text-ink-soft">{{ offering.note }}</p>
            <p v-if="offering.contact || offering.url" class="mt-1 text-[13px] text-ink-soft">
              <template v-if="offering.contact"><LinkText :text="offering.contact" /></template>
              <a v-if="offering.url" :href="offering.url" target="_blank" rel="noopener noreferrer" class="ml-3 text-primary hover:underline">詳情 →</a>
            </p>
          </li>
        </ul>
      </article>
    </section>

    <p v-if="!visibleGroups.length" class="text-sm text-ink-faint py-6">目前沒有收錄的練習方案。</p>

    <p class="mt-10 text-[13px] text-ink-faint">
      這裡收錄的是常態、可預約的帆船練習與包船體驗；有固定日期的體驗與航行請看「活動」，課程請看「課程」。價格與時間可能調整，報名前請向主辦確認。
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { getPracticePlaces, getPracticeOfferings, getSchools } from '../utils/data.js'
import { formatPracticePrice, formatPerPerson, groupPracticeByCity } from '../utils/practice.js'
import LinkText from '../components/LinkText.vue'

useHead({
  title: '帆船練習',
  meta: [
    { name: 'description', content: '上完帆船課程後想繼續練習？依碼頭整理台灣各地的課後練習與包船體驗方案，比較地點、費用與時間。' }
  ]
})

const cityGroups = computed(() => groupPracticeByCity(getPracticePlaces(), getPracticeOfferings()))

const selectedCity = ref('')
const cityOptions = computed(() => [
  { value: '', label: '全部' },
  ...cityGroups.value.map(g => ({ value: g.city, label: g.city }))
])
const visibleGroups = computed(() =>
  selectedCity.value ? cityGroups.value.filter(g => g.city === selectedCity.value) : cityGroups.value
)

const schoolByName = computed(() => new Map(getSchools().map(s => [s.name, s.id])))
const schoolId = (unit) => schoolByName.value.get(unit)

const priceText = formatPracticePrice
const perPerson = formatPerPerson
const detailText = (o) => [o.boat, o.duration, o.schedule].filter(Boolean).join('・')
const mapUrl = (place) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.city + place.name)}`
</script>
