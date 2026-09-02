<template>
  <span class="text-xs" :class="statusClass">
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarksStore } from '../stores/bookmarks.js'

const store = useBookmarksStore()

const statusText = computed(() => {
  switch (store.status) {
    case 'saving': return '保存中...'
    case 'dirty': return '未保存更改'
    case 'error': return `错误: ${store.lastError}`
    case 'conflict': return '数据冲突，请刷新'
    default: return '已保存'
  }
})

const statusClass = computed(() => {
  switch (store.status) {
    case 'saving': return 'text-zinc-500'
    case 'dirty': return 'text-zinc-600 dark:text-zinc-400'
    case 'error':
    case 'conflict': return 'text-zinc-900 dark:text-zinc-200'
    default: return 'text-zinc-500 dark:text-zinc-400'
  }
})
</script>
