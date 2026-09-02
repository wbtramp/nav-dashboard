<template>
  <div class="min-h-screen">
    <AppHeader />

    <div class="flex">
      <Sidebar />

      <div class="flex-1 min-w-0">
        <!-- Navigation Module -->
        <template v-if="ui.activeModule === 'navigation'">
          <HeroBanner />

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
                <button @click="loadData" class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition">重试</button>
              </div>
            </div>

            <template v-else>
              <template v-if="bookmarksStore.isFiltering">
                <div v-if="bookmarksStore.filteredBookmarks.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
                  <BookmarkCard
                    v-for="bm in bookmarksStore.filteredBookmarks"
                    :key="bm.id"
                    :bookmark="bm"
                    @edit="openEditBookmark"
                    @delete="onDeleteBookmark"
                  />
                </div>
                <EmptyState v-else message="没有找到匹配的网址" hint="试试其他关键词或清除筛选" />
              </template>

              <template v-else>
                <div v-if="bookmarksStore.categories.length">
                  <div v-if="auth.isEditMode" class="mb-4">
                    <button
                      @click="openAddCategory"
                      class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition"
                    >
                      + 添加分类
                    </button>
                  </div>

                  <CategorySection
                    v-for="cat in bookmarksStore.categories"
                    :key="cat.id"
                    :category="cat"
                    :items="bookmarksStore.bookmarksByCategory.get(cat.id) || []"
                    @editCategory="openEditCategory"
                    @deleteCategory="onDeleteCategory"
                    @editBookmark="openEditBookmark"
                    @deleteBookmark="onDeleteBookmark"
                    @addBookmark="openAddBookmark"
                    @reorder="onReorder"
                  />
                </div>
                <EmptyState
                  v-else
                  message="还没有任何分类"
                  :hint="auth.isEditMode ? '点击上方按钮添加第一个分类' : ''"
                />
              </template>
            </template>
          </main>
        </template>

        <!-- Notes Module -->
        <template v-else-if="ui.activeModule === 'notes'">
          <NotesView />
        </template>

        <!-- Knowledge Module -->
        <template v-else-if="ui.activeModule === 'knowledge'">
          <KnowledgeView />
        </template>
      </div>
    </div>

    <BookmarkEditDialog
      :visible="bookmarkDialogVisible"
      :bookmark="editingBookmark"
      :categories="bookmarksStore.categories"
      :default-category-id="defaultCategoryId"
      @close="bookmarkDialogVisible = false"
      @save="onSaveBookmark"
    />

    <CategoryEditDialog
      :visible="categoryDialogVisible"
      :category="editingCategory"
      @close="categoryDialogVisible = false"
      @save="onSaveCategory"
    />

    <OwnerLoginDialog
      :visible="ui.loginDialog"
      @close="ui.loginDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookmarksStore } from './stores/bookmarks.js'
import { useAuthStore } from './stores/auth.js'
import { useUiStore } from './stores/ui.js'
import { useAutoSave } from './composables/useAutoSave.js'
import { fetchBookmarks, saveBookmarks } from './services/github.js'
import AppHeader from './components/AppHeader.vue'
import Sidebar from './components/Sidebar.vue'
import HeroBanner from './components/HeroBanner.vue'
import TagFilterBar from './components/TagFilterBar.vue'
import CategorySection from './components/CategorySection.vue'
import BookmarkCard from './components/BookmarkCard.vue'
import BookmarkEditDialog from './components/BookmarkEditDialog.vue'
import CategoryEditDialog from './components/CategoryEditDialog.vue'
import OwnerLoginDialog from './components/OwnerLoginDialog.vue'
import EmptyState from './components/EmptyState.vue'
import NotesView from './components/notes/NotesView.vue'
import KnowledgeView from './components/knowledge/KnowledgeView.vue'

const bookmarksStore = useBookmarksStore()
const auth = useAuthStore()
const ui = useUiStore()

const loading = ref(true)
const loadError = ref('')

const bookmarkDialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const editingBookmark = ref(null)
const editingCategory = ref(null)
const defaultCategoryId = ref('')

useAutoSave()

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await fetchBookmarks(auth.pat || undefined)
    bookmarksStore.setData(result.data, result.sha)
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await auth.restoreSession()
  await loadData()
})

function openAddBookmark(catId) {
  editingBookmark.value = null
  defaultCategoryId.value = catId
  bookmarkDialogVisible.value = true
}

function openEditBookmark(bm) {
  editingBookmark.value = bm
  defaultCategoryId.value = ''
  bookmarkDialogVisible.value = true
}

function onSaveBookmark(form) {
  if (editingBookmark.value) {
    bookmarksStore.updateBookmark(editingBookmark.value.id, form)
  } else {
    bookmarksStore.addBookmark(form)
  }
  bookmarkDialogVisible.value = false
  triggerSave()
}

function onDeleteBookmark(id) {
  if (confirm('确定要删除这个网址吗？')) {
    bookmarksStore.removeBookmark(id)
    triggerSave()
  }
}

function openAddCategory() {
  editingCategory.value = null
  categoryDialogVisible.value = true
}

function openEditCategory(cat) {
  editingCategory.value = cat
  categoryDialogVisible.value = true
}

function onSaveCategory(form) {
  if (editingCategory.value) {
    bookmarksStore.updateCategory(editingCategory.value.id, form)
  } else {
    bookmarksStore.addCategory(form)
  }
  categoryDialogVisible.value = false
  triggerSave()
}

function onDeleteCategory(id) {
  const items = bookmarksStore.bookmarksByCategory.get(id) || []
  if (items.length > 0) {
    alert('该分类下还有网址，请先移除或移动它们。')
    return
  }
  if (confirm('确定要删除这个分类吗？')) {
    bookmarksStore.removeCategory(id)
    triggerSave()
  }
}

function onReorder(catId, idList) {
  bookmarksStore.reorderInCategory(catId, idList)
  triggerSave()
}

async function triggerSave() {
  if (!auth.isEditMode || !auth.pat) return
  try {
    let currentSha = bookmarksStore.sha
    if (!currentSha) {
      const result = await fetchBookmarks(auth.pat)
      currentSha = result.sha
    }
    bookmarksStore.status = 'saving'
    const result = await saveBookmarks(auth.pat, bookmarksStore.toJSON(), currentSha)
    bookmarksStore.sha = result.sha
    bookmarksStore.status = 'idle'
  } catch (e) {
    bookmarksStore.status = 'error'
    bookmarksStore.lastError = e.message
  }
}
</script>
