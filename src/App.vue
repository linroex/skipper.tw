<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <router-link to="/" class="text-2xl font-bold text-primary">skipper.tw</router-link>
          <div class="flex space-x-4">
            <router-link to="/activities" class="text-gray-700 hover:text-primary">活動</router-link>
            <router-link to="/courses" class="text-gray-700 hover:text-primary">課程</router-link>
            <router-link to="/schools" class="text-gray-700 hover:text-primary">學校</router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <router-view />
    </main>

    <footer class="bg-white border-t mt-12 py-6">
      <div class="max-w-6xl mx-auto px-4 text-center text-gray-600">
        <p>&copy; 2026 skipper.tw - 台灣帆船活動公告欄</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'

const siteUrl = 'https://skipper.tw'
const route = useRoute()

// Global SEO settings
useHead(computed(() => {
  const canonicalPath = route.path === '/' ? '/' : `${route.path.replace(/\/$/, '')}/`
  const canonicalUrl = `${siteUrl}${canonicalPath}`
  return {
    titleTemplate: (titleChunk) => {
      if (!titleChunk) return 'skipper.tw'
      return titleChunk.includes('skipper.tw') ? titleChunk : `${titleChunk} - skipper.tw`
    },
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    meta: [
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:site_name', content: 'skipper.tw' }
    ]
  }
}))
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
