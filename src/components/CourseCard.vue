<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <span class="bg-secondary text-white text-xs px-2 py-1 rounded">
          {{ organization }}
        </span>
        <span class="text-gray-500 text-sm">{{ region }}</span>
      </div>
      
      <h3 class="text-xl font-bold text-gray-800 mb-2">{{ course.title }}</h3>
      
      <div class="flex items-center space-x-2 mb-3">
        <span class="text-sm text-gray-600">
          {{ level === 'beginner' ? '初學者' : level === 'intermediate' ? '中級' : '高級' }}
        </span>
      </div>
      
      <p class="text-gray-600 text-sm mb-4">{{ course.description }}</p>
      
      <div class="space-y-2 text-sm text-gray-600 mb-4">
        <p><strong>日期：</strong>{{ formatDate(course.date) }}</p>
        <p><strong>地點：</strong>{{ course.location }}</p>
        <p><strong>主辦：</strong>{{ course.unit }}</p>
        <p><strong>價格：</strong>NT$ {{ formatPrice(course.price) }}</p>
        <p><strong>聯絡：</strong>{{ course.contact }}</p>
      </div>
      
      <a
        v-if="course.url"
        :href="course.url"
        target="_blank"
        class="block w-full text-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
      >
        了解更多
      </a>
      <p v-else class="text-sm text-gray-500 text-center">
        請洽 {{ course.contact }} 詢問
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const organization = computed(() => {
  const orgMap = {
    ASA: 'ASA',
    IYT: 'IYT',
    TSA: 'TSA',
    '': '認證課程'
  }
  return orgMap[props.course.organization] || props.course.organization || '認證課程'
})

const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>
