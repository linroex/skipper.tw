<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
    <div class="p-6 flex flex-col flex-1">
      <!-- 標籤列 -->
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <span class="bg-primary text-white text-xs px-2 py-1 rounded">{{ typeLabel }}</span>
        <span
          :class="[
            'text-xs px-2 py-1 rounded',
            membersOnly ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
          ]"
        >
          {{ audienceLabel }}
        </span>
        <span v-if="flexible" class="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded">
          隨時揪團
        </span>
        <span class="text-gray-500 text-sm ml-auto">{{ activity.region }}</span>
      </div>

      <h3 class="text-xl font-bold text-gray-800 mb-2">{{ activity.title }}</h3>

      <!-- 能力門檻 -->
      <div v-if="prerequisites.length" class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="req in prerequisites"
          :key="req"
          class="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded"
        >
          需 {{ req }}
        </span>
      </div>

      <p v-if="activity.description" class="text-gray-600 text-sm mb-4">{{ activity.description }}</p>

      <div class="space-y-2 text-sm text-gray-600 mb-4">
        <p><strong>日期：</strong>{{ scheduleText }}</p>
        <p v-if="activity.duration"><strong>時長：</strong>{{ activity.duration }}</p>
        <p><strong>地點：</strong>{{ activity.location }}</p>
        <p>
          <strong>主辦：</strong>
          <router-link
            v-if="schoolRoute"
            :to="schoolRoute"
            class="text-primary hover:underline"
          >{{ activity.unit }}</router-link>
          <span v-else>{{ activity.unit }}</span>
        </p>
        <p><strong>費用：</strong>{{ priceText }}</p>
        <p><strong>聯絡：</strong>{{ activity.contact }}</p>
      </div>

      <a
        v-if="activity.url"
        :href="activity.url"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-auto block w-full text-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
      >
        了解更多
      </a>
      <p v-else class="mt-auto text-sm text-gray-500 text-center">
        請洽 {{ activity.contact }} 詢問
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  getTypeLabel,
  getAudienceLabel,
  isMembersOnly,
  isFlexible,
  formatSchedule,
  formatActivityPrice
} from '../utils/activity.js'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  schoolRoute: {
    type: [Object, String],
    default: null
  }
})

const typeLabel = computed(() => getTypeLabel(props.activity.type))
const audienceLabel = computed(() => getAudienceLabel(props.activity.audience))
const membersOnly = computed(() => isMembersOnly(props.activity))
const flexible = computed(() => isFlexible(props.activity))
const prerequisites = computed(() => props.activity.prerequisites || [])
const scheduleText = computed(() => formatSchedule(props.activity))
const priceText = computed(() => formatActivityPrice(props.activity))
</script>
