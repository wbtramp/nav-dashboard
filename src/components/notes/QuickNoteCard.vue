<template>
  <div
    class="relative rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 hover:shadow-sm transition group"
    :class="note.pinned ? 'ring-1 ring-zinc-300 dark:ring-zinc-600' : ''"
  >
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate pr-6">
        {{ note.title }}
      </h3>
      <button
        v-if="isEditMode"
        @click="$emit('toggle-pin')"
        class="absolute top-3 right-3 text-xs"
        :title="note.pinned ? '取消置顶' : '置顶'"
      >
        {{ note.pinned ? '📌' : '📍' }}
      </button>
    </div>

    <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-4 whitespace-pre-wrap mb-3">
      {{ note.content }}
    </p>

    <div class="flex items-center justify-between">
      <div class="flex gap-1 flex-wrap">
        <span v-for="tag in note.tags" :key="tag" class="px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-400">
          {{ tag }}
        </span>
      </div>
      <div v-if="isEditMode" class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button @click="$emit('edit')" class="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">编辑</button>
        <button @click="$emit('delete')" class="text-xs text-gray-400 hover:text-zinc-900 dark:hover:text-white">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

const props = defineProps({
  note: { type: Object, required: true },
  categoryName: { type: String, default: '' },
})

defineEmits(['edit', 'delete', 'toggle-pin'])

const auth = useAuthStore()
const isEditMode = computed(() => auth.isEditMode)
</script>
