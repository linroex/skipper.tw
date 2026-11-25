<template>
  <span>
    <template v-for="(part, i) in parts" :key="i">
      <a
        v-if="part.url"
        :href="part.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:underline break-all"
      >{{ part.text }}</a>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>

<script setup>
import { computed } from 'vue'

// 把文字裡的網址變成可點擊的連結（其餘文字照原樣顯示）
const props = defineProps({
  text: { type: String, default: '' }
})

const parts = computed(() => {
  const out = []
  let last = 0
  const re = /https?:\/\/[^\s，。、）)]+/g
  for (const m of props.text.matchAll(re)) {
    if (m.index > last) out.push({ text: props.text.slice(last, m.index) })
    out.push({ text: m[0].replace(/^https?:\/\//, ''), url: m[0] })
    last = m.index + m[0].length
  }
  if (last < props.text.length) out.push({ text: props.text.slice(last) })
  return out
})
</script>
