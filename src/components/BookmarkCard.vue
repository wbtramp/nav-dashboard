<template>
  <a
    :href="bookmark.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group block rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200"
  >
    <div class="flex items-start gap-3">
      <img
        :src="faviconUrl"
        class="w-8 h-8 rounded-lg shrink-0 bg-gray-100 dark:bg-zinc-800"
        @error="onFaviconError"
        alt=""
      />
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {{ bookmark.title }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {{ hostname }}
        </p>
        <p v-if="bookmark.description" class="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
          {{ bookmark.description }}
        </p>
      </div>
    </div>

    <div v-if="bookmark.tags.length" class="flex flex-wrap gap-1 mt-3">
      <span
        v-for="tag in bookmark.tags"
        :key="tag"
        class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400"
      >
        {{ tag }}
      </span>
    </div>

    <div v-if="isEditMode" class="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
      <button
        @click.prevent="$emit('edit', bookmark)"
        class="p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
      >
        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      <button
        @click.prevent="$emit('delete', bookmark.id)"
        class="p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
      >
        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </a>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useFavicon } from '../composables/useFavicon.js'

const props = defineProps({
  bookmark: { type: Object, required: true },
})

defineEmits(['edit', 'delete'])

const auth = useAuthStore()
const { getFaviconUrl } = useFavicon()
const faviconError = ref(false)

const isEditMode = computed(() => auth.isEditMode)

const faviconUrl = computed(() => {
  if (faviconError.value) return ''
  return props.bookmark.icon || getFaviconUrl(props.bookmark.url)
})

const hostname = computed(() => {
  try {
    return new URL(props.bookmark.url).hostname
  } catch {
    return props.bookmark.url
  }
})

function onFaviconError() {
  faviconError.value = true
}
</script>

<style scoped>
.group { position: relative; }
</style>
