<template>
  <div class="bg-surface rounded-lg border border-line overflow-hidden">
    <!-- 桌面版表格 (隱藏在小螢幕) -->
    <div class="hidden md:block">
      <table class="w-full">
        <thead class="border-b border-line">
          <tr>
            <th v-for="header in headers" :key="header" class="px-6 py-3 text-left text-xs font-medium text-ink-faint uppercase tracking-wide">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr
            v-for="item in items"
            :key="item.id"
            :class="['hover:bg-paper', getRowClass(item)]"
          >
            <td v-if="headerExtra?.render" class="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary tabular-nums">
              {{ headerExtra.render(item) }}
            </td>
            <td v-if="titleKey" class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="font-medium text-ink">{{ item[titleKey] }}</span>
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
    <div class="md:hidden divide-y divide-line">
      <div
        v-for="item in items"
        :key="item.id"
        :class="['px-4 py-3.5', getRowClass(item)]"
      >
        <!-- 頂部資訊（日期和標籤） -->
        <div v-if="headerExtra" class="flex justify-between items-start gap-2 mb-1">
          <span class="text-sm font-bold text-primary tabular-nums">{{ headerExtra.render(item) }}</span>
          <span v-if="headerExtra.tagRender" :class="[headerExtra.tagClass, 'whitespace-nowrap']">
            {{ typeof headerExtra.tagRender === 'function' ? headerExtra.tagRender(item) : headerExtra.tagRender }}
          </span>
        </div>

        <!-- 主標題 -->
        <h3 v-if="titleKey" class="font-bold text-ink text-base leading-snug text-balance">
          {{ item[titleKey] }}
        </h3>

        <!-- 詳細資訊：精簡成一行，不再逐列顯示標籤 -->
        <div v-if="columns.length > 0" class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-soft">
          <component
            v-for="col in columns"
            :key="col.key"
            :is="col.component || 'span'"
            v-bind="typeof col.props === 'function' ? col.props(item) : col.props"
            class="min-w-0 break-words"
          >
            {{ typeof col.render === 'function' ? col.render(item) : (item[col.key] || '-') }}
          </component>
        </div>
      </div>
    </div>
    
    <!-- 空狀態 -->
    <div v-if="items.length === 0" class="text-center py-12 text-ink-faint">
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
  },
  rowClass: {
    type: [String, Function],
    default: ''
  }
})

const getRowClass = (item) => {
  return typeof props.rowClass === 'function' ? props.rowClass(item) : props.rowClass
}
</script>
