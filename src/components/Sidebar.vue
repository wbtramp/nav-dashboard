<template>
  <aside class="w-14 md:w-44 shrink-0 border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-h-[calc(100vh-57px)] overflow-y-auto no-scrollbar">
    <nav class="py-4 flex md:flex-col gap-0.5 px-2 md:px-3">
      <button
        v-for="item in visibleModules"
        :key="item.key"
        @click="ui.activeModule = item.key"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition w-full"
        :class="ui.activeModule === item.key
          ? 'text-gray-900 dark:text-white font-semibold'
          : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'"
        :style="ui.activeModule === item.key ? { backgroundColor: 'var(--accent-bg)' } : {}"
      >
        <span class="text-base">{{ item.icon }}</span>
        <span class="hidden md:inline text-[13px]">{{ item.label }}</span>
      </button>
    </nav>

    <template v-if="ui.activeModule === 'navigation' && categories.length">
      <div class="hidden md:block mx-3 mb-2 border-t border-gray-100 dark:border-zinc-800" />
      <nav class="hidden md:flex flex-col gap-0.5 px-3 pb-4">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="scrollToCategory(cat.id)"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition w-full text-left"
          :class="ui.activeCategoryId === cat.id
            ? 'text-gray-900 dark:text-white font-medium'
            : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'"
          :style="ui.activeCategoryId === cat.id ? { backgroundColor: 'var(--accent-bg)' } : {}"
        >
          <span class="text-sm shrink-0">{{ cat.icon }}</span>
          <span class="truncate">{{ cat.name }}</span>
        </button>
      </nav>
    </template>
  </aside>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { useAuthStore } from '../stores/auth.js'
import { useBookmarksStore } from '../stores/bookmarks.js'

const ui = useUiStore()
const auth = useAuthStore()
const bookmarksStore = useBookmarksStore()

const allModules = [
  { key: 'navigation', label: '导航', icon: '' },
  { key: 'notes', label: '记事本', icon: '✎' },
  { key: 'feishu', label: '飞书', icon: '🪶' },
  { key: 'knowledge', label: '资料库', icon: '◈' },
]

const visibleModules = computed(() => {
  if (auth.isLoggedIn && auth.isOwner) return allModules
  return allModules.filter(m => m.key === 'navigation')
})

const categories = computed(() => bookmarksStore.categories)

function scrollToCategory(catId) {
  ui.activeCategoryId = catId
  const el = document.getElementById('cat-' + catId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

watch(() => ui.activeModule, (mod) => {
  if (mod !== 'navigation') {
    ui.activeCategoryId = ''
  }
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
