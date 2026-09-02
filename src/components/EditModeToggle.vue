<template>
  <div>
    <div v-if="auth.isEditMode" class="flex items-center gap-2">
      <button
        @click="auth.toggleEditMode()"
        class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-80 transition"
      >
        编辑中
      </button>
      <SyncStatusBar />
    </div>
    <button
      v-else-if="auth.isLoggedIn"
      @click="auth.toggleEditMode()"
      class="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
    >
      编辑
    </button>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js'
import SyncStatusBar from './SyncStatusBar.vue'

const auth = useAuthStore()
</script>
