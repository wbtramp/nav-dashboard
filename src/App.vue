<template>
  <div class="min-h-screen">
    <AppHeader />

    <div class="flex">
      <Sidebar />

      <div class="flex-1 min-w-0">
        <!-- Navigation Module -->
        <template v-if="ui.activeModule === 'navigation'">
          <NavigationView
            :loading="loading"
            :load-error="loadError"
            @retry="loadData"
            @edit-bookmark="openEditBookmark"
            @delete-bookmark="onDeleteBookmark"
            @edit-category="openEditCategory"
            @delete-category="onDeleteCategory"
            @add-bookmark="openAddBookmark"
          />
        </template>

        <!-- Notes Module -->
        <template v-else-if="ui.activeModule === 'notes'">
          <NotesView />
        </template>

        <!-- Feishu Module -->
        <template v-else-if="ui.activeModule === 'feishu'">
          <FeishuView />
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
import NavigationView from './components/NavigationView.vue'
import BookmarkEditDialog from './components/BookmarkEditDialog.vue'
import CategoryEditDialog from './components/CategoryEditDialog.vue'
import OwnerLoginDialog from './components/OwnerLoginDialog.vue'
import NotesView from './components/notes/NotesView.vue'
import FeishuView from './components/feishu/FeishuView.vue'
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
    if (bookmarksStore.settings.accentColor) {
      ui.setAccentColor(bookmarksStore.settings.accentColor)
    }
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
