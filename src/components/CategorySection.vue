<template>
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-4 px-1">
      <span class="text-base">{{ category.icon }}</span>
      <h2 class="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
        {{ category.name }}
      </h2>
      <span class="text-xs text-gray-400 dark:text-zinc-500">
        {{ items.length }}
      </span>

      <div v-if="isEditMode" class="ml-auto flex items-center gap-1">
        <button
          @click="$emit('editCategory', category)"
          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button
          @click="$emit('deleteCategory', category.id)"
          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>

    <VueDraggable
      v-if="!category.collapsed"
      v-model="localItems"
      :disabled="!isEditMode"
      :animation="200"
      ghost-class="sortable-ghost"
      drag-class="sortable-drag"
      group="bookmarks"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3"
      @end="onDragEnd"
    >
      <BookmarkCard
        v-for="bm in localItems"
        :key="bm.id"
        :bookmark="bm"
        @edit="$emit('editBookmark', $event)"
        @delete="$emit('deleteBookmark', $event)"
      />
    </VueDraggable>

    <div v-if="isEditMode && !category.collapsed" class="mt-3">
      <button
        @click="$emit('addBookmark', category.id)"
        class="w-full py-2 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 text-sm text-gray-400 dark:text-zinc-500 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition"
      >
        + 添加网址
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useAuthStore } from '../stores/auth.js'
import BookmarkCard from './BookmarkCard.vue'

const props = defineProps({
  category: { type: Object, required: true },
  items: { type: Array, required: true },
})

const emit = defineEmits(['editCategory', 'deleteCategory', 'editBookmark', 'deleteBookmark', 'addBookmark', 'reorder'])

const auth = useAuthStore()
const isEditMode = computed(() => auth.isEditMode)

const localItems = computed({
  get: () => props.items,
  set: () => {},
})

function onDragEnd() {
  const idOrder = localItems.value.map(b => b.id)
  emit('reorder', props.category.id, idOrder)
}
</script>
