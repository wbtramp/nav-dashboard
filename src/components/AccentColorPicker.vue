<template>
  <div class="flex items-center gap-2">
    <button
      v-for="color in presetColors"
      :key="color"
      @click="selectColor(color)"
      class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
      :class="ui.accentColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'"
      :style="{ backgroundColor: color }"
      :title="color"
    />
    <label class="relative w-6 h-6 rounded-full overflow-hidden border border-gray-300 dark:border-zinc-600 cursor-pointer hover:scale-110 transition-transform">
      <input
        type="color"
        :value="ui.accentColor"
        @input="selectColor($event.target.value)"
        class="absolute inset-0 w-10 h-10 -top-2 -left-2 cursor-pointer opacity-0"
      />
      <div class="w-full h-full bg-conic-gradient" style="background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);" />
    </label>
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui.js'
import { useBookmarksStore } from '../stores/bookmarks.js'

const ui = useUiStore()
const bookmarksStore = useBookmarksStore()

const presetColors = [
  '#863bff',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#6b7280',
]

function selectColor(color) {
  ui.setAccentColor(color)
  bookmarksStore.settings.accentColor = color
  bookmarksStore.markDirty()
}
</script>
