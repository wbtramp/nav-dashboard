<template>
  <div
    class="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 hover:shadow-sm transition group cursor-pointer"
    @click="$emit('open')"
  >
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 pr-4">
        {{ entry.title }}
      </h3>
    </div>

    <p v-if="entry.summary" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
      {{ entry.summary }}
    </p>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400">
          {{ entry.category }}
        </span>
        <span class="text-[10px] text-gray-400">
          {{ formatDate(entry.updatedAt) }}
        </span>
      </div>
      <div v-if="isEditMode" class="flex gap-2 opacity-0 group-hover:opacity-100 transition" @click.stop>
        <button @click="$emit('edit')" class="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">编辑</button>
        <button @click="$emit('delete')" class="text-xs text-gray-400 hover:text-zinc-900 dark:hover:text-white">删除</button>
      </div>
    </div>

    <div v-if="entry.tags?.length" class="flex gap-1 flex-wrap mt-2">
      <span v-for="tag in entry.tags" :key="tag" class="px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-zinc-600 text-gray-500 dark:text-gray-400">
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

defineProps({
  entry: { type: Object, required: true },
})

defineEmits(['open', 'edit', 'delete'])

const auth = useAuthStore()
const isEditMode = computed(() => auth.isEditMode)

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>
