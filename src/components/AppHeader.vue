<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-gray-100 dark:border-zinc-800">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight shrink-0">
        {{ bookmarks.settings.title || 'Nav Dashboard' }}
      </h1>

      <div class="flex-1 min-w-[200px] max-w-md">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="ui.searchQuery"
            type="text"
            placeholder="搜索..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-zinc-700 transition"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <ThemeToggle />
        <EditModeToggle />
        <button
          v-if="!auth.isLoggedIn"
          @click="ui.loginDialog = true"
          class="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
        >
          登录
        </button>
        <div v-else class="flex items-center gap-2">
          <span class="text-xs text-gray-400 dark:text-zinc-500">{{ auth.login }}</span>
          <button
            @click="auth.logout()"
            class="px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition"
          >
            退出
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useBookmarksStore } from '../stores/bookmarks.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import ThemeToggle from './ThemeToggle.vue'
import EditModeToggle from './EditModeToggle.vue'

const bookmarks = useBookmarksStore()
const auth = useAuthStore()
const ui = useUiStore()
</script>
