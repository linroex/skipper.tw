<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- 桌面版表格 (隱藏在小螢幕) -->
    <div class="hidden md:block">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th v-for="header in headers" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
            <td v-if="headerExtra?.render" class="px-6 py-4 whitespace-nowrap text-sm font-bold text-sky-500">
              {{ headerExtra.render(item) }}
            </td>
            <td v-if="titleKey" class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900">{{ item[titleKey] }}</span>
                <span v-if="headerExtra?.tagRender" :class="headerExtra.tagClass">
                  {{ typeof headerExtra.tagRender === 'function' ? headerExtra.tagRender(item) : headerExtra.tagRender }}
                </span>
              </div>
            </td>
            <td v-for="col in columns" :key="col.key" class="px-6 py-4">
              <component :is="col.component || 'span'" v-bind="typeof col.props === 'function' ? col.props(item) : col.props">
                {{ typeof col.render === 'function' ? col.render(item) : (item[col.key] || '-') }}
              </component>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 手機版卡片列表 (隱藏在桌面) -->
    <div class="md:hidden space-y-4 p-4">
      <div v-for="item in items" :key="item.id" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <!-- 頂部資訊（日期和標籤） -->
        <div v-if="headerExtra" class="flex justify-between items-start mb-2">
          <span class="text-sm font-bold text-sky-500">{{ headerExtra.render(item) }}</span>
          <span v-if="headerExtra.tagRender" :class="headerExtra.tagClass">
            {{ typeof headerExtra.tagRender === 'function' ? headerExtra.tagRender(item) : headerExtra.tagRender }}
          </span>
        </div>
        
        <!-- 主標題 -->
        <h3 v-if="titleKey" class="font-medium text-gray-900 text-lg mb-2">
          {{ item[titleKey] }}
        </h3>
        
        <!-- 詳細資訊 -->
        <div v-if="columns.length > 0" class="space-y-1 text-sm text-gray-600">
          <div v-for="col in columns" :key="col.key" class="flex justify-between">
            <span>{{ col.label }}</span>
            <span class="font-medium">
              {{ typeof col.render === 'function' ? col.render(item) : (item[col.key] || '-') }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空狀態 -->
    <div v-if="items.length === 0" class="text-center py-12 text-gray-500">
      {{ emptyMessage || '暫無資料' }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  headers: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  titleKey: {
    type: String,
    default: ''
  },
  headerExtra: {
    type: Object,
    default: () => ({ render: null, tagRender: null, tagClass: '' })
  },
  emptyMessage: {
    type: String,
    default: ''
  }
})
</script>
