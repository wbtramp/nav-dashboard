<template>
  <div
    class="relative overflow-hidden cursor-pointer select-none border-b border-gray-100 dark:border-zinc-800"
    :class="ui.bannerCollapsed ? 'h-11' : 'h-[200px] md:h-[220px]'"
    @click="ui.toggleBanner()"
  >
    <div class="absolute inset-0 bg-white dark:bg-zinc-950" />

    <div
      class="relative h-full flex flex-col items-center justify-center transition-opacity duration-300"
      :class="ui.bannerCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'"
    >
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
        个人工作台
      </h2>
      <p class="text-gray-400 dark:text-zinc-500 text-sm md:text-base tracking-[0.3em] mb-2">
        导航 &middot; 记事 &middot; 知识库
      </p>
      <p class="text-gray-300 dark:text-zinc-600 text-xs">
        {{ greeting }}
      </p>
    </div>

    <div
      v-if="ui.bannerCollapsed"
      class="relative h-full flex items-center px-6"
    >
      <span class="text-gray-900 dark:text-white font-semibold text-sm tracking-wide">个人工作台</span>
    </div>

    <button
      class="absolute bottom-2 right-4 text-gray-300 dark:text-zinc-600 hover:text-gray-500 dark:hover:text-zinc-400 transition text-xs"
      @click.stop="ui.toggleBanner()"
    >
      {{ ui.bannerCollapsed ? '展开' : '收起' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/ui.js'

const ui = useUiStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  let period = '晚上好'
  if (h < 6) period = '凌晨好'
  else if (h < 12) period = '上午好'
  else if (h < 14) period = '中午好'
  else if (h < 18) period = '下午好'
  return `${dateStr} · ${period}`
})
</script>
