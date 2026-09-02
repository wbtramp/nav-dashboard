<template>
  <div class="flex items-center justify-center min-h-[300px] text-gray-400 dark:text-gray-600">
    <div class="text-center">
      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      <p class="text-lg font-medium">{{ message }}</p>
      <p v-if="hint" class="text-sm mt-1">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '暂无内容' },
  hint: { type: String, default: '' },
})
</script>
