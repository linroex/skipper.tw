<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <span class="bg-primary text-white text-xs px-2 py-1 rounded">{{ type }}</span>
        <span class="text-gray-500 text-sm">{{ activity.region }}</span>
      </div>
      <h3 class="text-xl font-bold text-gray-800 mb-2">{{ activity.title }}</h3>
      <p class="text-gray-600 text-sm mb-4">{{ activity.description }}</p>
      
      <div class="space-y-2 text-sm text-gray-600 mb-4">
        <p><strong>日期：</strong>{{ formatItemDate(activity) }}</p>
        <p><strong>地點：</strong>{{ activity.location }}</p>
        <p><strong>主辦：</strong>{{ activity.unit }}</p>
        <p><strong>聯絡：</strong>{{ activity.contact }}</p>
      </div>
      
      <a
        v-if="activity.url"
        :href="activity.url"
        target="_blank"
        class="block w-full text-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
      >
        了解更多
      </a>
      <p v-else class="text-sm text-gray-500 text-center">
        請洽 {{ activity.contact }} 詢問
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatItemDate } from '../utils/format.js'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const type = computed(() => {
  const typeMap = {
    workshop: '體驗課程',
    race: '帆船賽事',
    camp: '夏令營',
    seminar: '講座'
  }
  return typeMap[props.activity.type] || props.activity.type
})

</script>
