<template>
  <a
    :href="bookmark.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group block rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-200"
  >
    <div class="flex items-start gap-2.5">
      <img
        :src="faviconUrl"
        class="w-7 h-7 rounded-md shrink-0 bg-gray-100 dark:bg-zinc-800"
        @error="onFaviconError"
        alt=""
      />
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-snug">
          {{ bookmark.title }}
        </h3>
        <p v-if="bookmark.description" class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {{ bookmark.description }}
        </p>
      </div>
    </div>

    <div v-if="isEditMode" class="absolute top-1.5 right-1.5 hidden group-hover:flex items-center gap-0.5">
      <button
        @click.prevent="$emit('edit', bookmark)"
        class="p-1 rounded bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
      >
        <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      <button
        @click.prevent="$emit('delete', bookmark.id)"
        class="p-1 rounded bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
      >
        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

function onFaviconError() {
  faviconError.value = true
}
</script>

<style scoped>
.group { position: relative; }
</style>
