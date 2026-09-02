<template>
  <div
    class="relative rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 hover:shadow-sm transition group"
    :class="note.pinned ? 'ring-1 ring-zinc-300 dark:ring-zinc-600' : ''"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
          {{ note.title }}
        </h3>
        <p class="text-xs text-gray-400">
          {{ formatDate(note.updatedAt) }}
          <span v-if="categoryName" class="ml-2">{{ categoryName }}</span>
        </p>
      </div>
      <button
        v-if="isEditMode"
        @click="$emit('toggle-pin')"
        class="text-sm"
        :title="note.pinned ? '取消置顶' : '置顶'"
      >
        {{ note.pinned ? '' : '📍' }}
      </button>
    </div>

    <div class="text-sm text-gray-700 dark:text-gray-300 line-clamp-6 mb-3 prose prose-sm dark:prose-invert max-w-none">
      <div v-html="renderedContent" />
    </div>

    <div class="flex items-center justify-between">
      <div class="flex gap-1 flex-wrap">
        <span v-for="tag in note.tags" :key="tag" class="px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-400">
          {{ tag }}
        </span>
      </div>
      <div v-if="isEditMode" class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button @click="$emit('edit')" class="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">编辑</button>
        <button @click="$emit('delete')" class="text-xs text-gray-400 hover:text-zinc-900 dark:hover:text-white">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { marked } from 'marked'

const props = defineProps({
  note: { type: Object, required: true },
  categoryName: { type: String, default: '' },
})

defineEmits(['edit', 'delete', 'toggle-pin'])

const auth = useAuthStore()
const isEditMode = computed(() => auth.isEditMode)

const renderedContent = computed(() => {
  try {
    return marked(props.note.content || '', { breaks: true })
  } catch {
    return props.note.content || ''
  }
})

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
