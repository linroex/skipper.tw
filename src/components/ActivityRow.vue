<template>
  <li class="border-b border-line">
    <component
      :is="activity.url ? 'a' : 'div'"
      :href="activity.url || undefined"
      :target="activity.url ? '_blank' : undefined"
      :rel="activity.url ? 'noopener noreferrer' : undefined"
      class="group flex items-baseline gap-3.5 py-4 px-0.5"
    >
      <!-- 日期欄 -->
      <span
        :class="[
          'flex-none w-[76px] max-sm:w-[60px] text-sm max-sm:text-[13px] font-bold whitespace-nowrap tabular-nums',
          flexible ? 'text-ink-faint font-semibold' : 'text-primary'
        ]"
      >{{ whenText }}</span>

      <!-- 標題與副標 -->
      <span class="min-w-0 flex-1">
        <span class="text-base max-sm:text-[15px] font-bold leading-snug group-hover:text-primary">
          {{ activity.title }}<span
            v-for="cond in conditions"
            :key="cond"
            class="ml-2 align-[1px] inline-block whitespace-nowrap text-[11px] font-bold text-cond bg-cond-bg rounded px-1.5 py-px"
          >{{ cond }}</span>
        </span>
        <span class="block text-[13px] text-ink-soft mt-0.5">{{ subText }}</span>
      </span>

      <!-- 價格欄（沒有就不顯示） -->
      <span v-if="price.main" class="flex-none self-center text-right whitespace-nowrap tabular-nums">
        <span class="block text-[13.5px] max-sm:text-xs font-bold">{{ price.main }}</span>
        <span v-if="price.note" class="block text-[11px] font-medium text-ink-faint">{{ price.note }}</span>
      </span>
    </component>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import {
  isFlexible,
  getConditions,
  formatWhenShort,
  getSubExtras,
  getPriceParts
} from '../utils/activity.js'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const flexible = computed(() => isFlexible(props.activity))
const conditions = computed(() => getConditions(props.activity))
const whenText = computed(() => formatWhenShort(props.activity))
const price = computed(() => getPriceParts(props.activity))

const subText = computed(() => {
  const base = [props.activity.location, props.activity.unit].filter(Boolean).join('・')
  const extras = getSubExtras(props.activity)
  return extras.length ? `${base}｜${extras.join('，')}` : base
})
</script>
