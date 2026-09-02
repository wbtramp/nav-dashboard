<template>
  <aside class="w-14 md:w-44 shrink-0 border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-h-[calc(100vh-57px)]">
    <nav class="py-6 flex md:flex-col gap-0.5 px-2 md:px-3">
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
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { useAuthStore } from '../stores/auth.js'

const ui = useUiStore()
const auth = useAuthStore()

const allModules = [
  { key: 'navigation', label: '导航', icon: '⊞' },
  { key: 'notes', label: '记事本', icon: '✎' },
  { key: 'feishu', label: '飞书', icon: '🪶' },
  { key: 'knowledge', label: '资料库', icon: '◈' },
]

const visibleModules = computed(() => {
  if (auth.isLoggedIn && auth.isOwner) return allModules
  return allModules.filter(m => m.key === 'navigation')
})
</script>
