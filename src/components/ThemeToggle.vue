<template>
  <button
    @click="cycleTheme"
    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
    :title="'主题: ' + themeLabel"
  >
    <svg v-if="ui.theme === 'light'" class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
    </svg>
    <svg v-else-if="ui.theme === 'dark'" class="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
    </svg>
    <svg v-else class="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"/>
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/ui.js'

const ui = useUiStore()

const themeLabel = computed(() => {
  switch (ui.theme) {
    case 'light': return '浅色'
    case 'dark': return '深色'
    default: return '跟随系统'
  }
})

function cycleTheme() {
  const order = ['system', 'light', 'dark']
  const idx = order.indexOf(ui.theme)
  ui.setTheme(order[(idx + 1) % order.length])
}
</script>
