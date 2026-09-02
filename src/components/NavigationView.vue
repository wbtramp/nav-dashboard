<template>
  <div>
    <HeroBanner />

    <div class="sticky top-[57px] z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center gap-0.5 overflow-x-auto py-2 no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="activeCategoryId = cat.id"
            class="shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition"
            :class="activeCategoryId === cat.id
              ? 'text-white'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900'"
            :style="activeCategoryId === cat.id ? { backgroundColor: 'var(--accent)' } : {}"
          >
            <span class="mr-1.5">{{ cat.icon }}</span>{{ cat.name }}
          </button>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <TagFilterBar />

      <div v-if="loading" class="flex items-center justify-center min-h-[300px]">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-zinc-200 border-t-zinc-500 rounded-full animate-spin mx-auto mb-4" />
          <p class="text-gray-400">加载中...</p>
        </div>
      </div>

      <div v-else-if="loadError" class="flex items-center justify-center min-h-[300px]">
        <div class="text-center">
          <p class="text-zinc-800 dark:text-zinc-200 text-lg mb-2">加载失败</p>
          <p class="text-gray-400 text-sm mb-4">{{ loadError }}</p>
          <button @click="$emit('retry')" class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition">重试</button>
        </div>
      </div>

      <template v-else>
        <template v-if="isFiltering">
          <div v-if="filteredBookmarks.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
            <BookmarkCard
              v-for="bm in filteredBookmarks"
              :key="bm.id"
              :bookmark="bm"
              @edit="$emit('editBookmark', $event)"
              @delete="$emit('deleteBookmark', $event)"
            />
          </div>
          <EmptyState v-else message="没有找到匹配的网址" hint="试试其他关键词或清除筛选" />
        </template>

        <template v-else-if="activeCategory">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-lg">{{ activeCategory.icon }}</span>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ activeCategory.name }}</h2>
            <span class="text-xs text-gray-400 dark:text-zinc-500 ml-1">{{ activeItems.length }} 个网址</span>

            <div v-if="isEditMode" class="ml-auto flex items-center gap-1">
              <button
                @click="$emit('editCategory', activeCategory)"
                class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="$emit('deleteCategory', activeCategory.id)"
                class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <VueDraggable
            v-model="draggableItems"
            :disabled="!isEditMode"
            :animation="200"
            ghost-class="sortable-ghost"
            drag-class="sortable-drag"
            group="bookmarks"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3"
            @end="onDragEnd"
          >
            <BookmarkCard
              v-for="bm in activeItems"
              :key="bm.id"
              :bookmark="bm"
              @edit="$emit('editBookmark', $event)"
              @delete="$emit('deleteBookmark', $event)"
            />
          </VueDraggable>

          <div v-if="isEditMode" class="mt-4">
            <button
              @click="$emit('addBookmark', activeCategory.id)"
              class="w-full py-3 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 text-sm text-gray-400 dark:text-zinc-500 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition"
            >
              + 添加网址
            </button>
          </div>
        </template>

        <EmptyState
          v-else
          message="还没有任何分类"
          :hint="isEditMode ? '点击编辑模式添加第一个分类' : ''"
        />
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useBookmarksStore } from '../stores/bookmarks.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import HeroBanner from './HeroBanner.vue'
import TagFilterBar from './TagFilterBar.vue'
import BookmarkCard from './BookmarkCard.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  loading: Boolean,
  loadError: String,
})

defineEmits(['retry', 'editBookmark', 'deleteBookmark', 'editCategory', 'deleteCategory', 'addBookmark', 'reorder'])

const bookmarksStore = useBookmarksStore()
const auth = useAuthStore()
const ui = useUiStore()

const isEditMode = computed(() => auth.isEditMode)
const isFiltering = computed(() => bookmarksStore.isFiltering)
const filteredBookmarks = computed(() => bookmarksStore.filteredBookmarks)
const categories = computed(() => bookmarksStore.categories)

const activeCategoryId = ref('')

watch(categories, (cats) => {
  if (cats.length && !cats.find(c => c.id === activeCategoryId.value)) {
    activeCategoryId.value = cats[0].id
  }
}, { immediate: true })

const activeCategory = computed(() =>
  categories.value.find(c => c.id === activeCategoryId.value) || null
)

const activeItems = computed(() =>
  bookmarksStore.bookmarks.filter(b => b.categoryId === activeCategoryId.value)
)

const draggableItems = computed({
  get: () => activeItems.value,
  set: () => {},
})

function onDragEnd() {
  const idOrder = activeItems.value.map(b => b.id)
  // Reorder within the category
  const allItems = bookmarksStore.bookmarks.filter(b => b.categoryId !== activeCategoryId.value)
  const ordered = idOrder.map(id => bookmarksStore.bookmarks.find(b => b.id === id)).filter(Boolean)
  bookmarksStore.bookmarks = [...allItems, ...ordered]
  bookmarksStore.markDirty()
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
