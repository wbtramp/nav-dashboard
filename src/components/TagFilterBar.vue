<template>
  <div v-if="store.allTags.length" class="flex flex-wrap gap-1.5 px-4 py-3">
    <button
      v-for="tag in store.allTags"
      :key="tag.name"
      @click="ui.toggleTag(tag.name)"
      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition border"
      :class="ui.activeTags.includes(tag.name)
        ? 'text-white border-transparent'
        : 'bg-white text-gray-500 border-gray-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'"
      :style="ui.activeTags.includes(tag.name) ? { backgroundColor: 'var(--accent)' } : {}"
    >
      {{ tag.name }}
      <span class="opacity-50 text-[10px]">{{ tag.count }}</span>
    </button>
    <button
      v-if="ui.activeTags.length"
      @click="ui.clearFilters()"
      class="px-2.5 py-1 rounded-md text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition"
    >
      清除
    </button>
  </div>
</template>

<script setup>
import { useBookmarksStore } from '../stores/bookmarks.js'
import { useUiStore } from '../stores/ui.js'

const store = useBookmarksStore()
const ui = useUiStore()
</script>
