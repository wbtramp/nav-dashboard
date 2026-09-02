<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">记事本</h1>
          <p class="text-sm text-gray-400 mt-0.5">{{ notesStore.notes.length }} 条笔记</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <input
              v-model="search"
              type="text"
              placeholder="搜索笔记..."
              class="w-48 pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <button
            v-if="auth.isEditMode"
            @click="openNewNote"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition"
          >
            + 新建笔记
          </button>
        </div>
      </div>

      <div v-if="notesStore.categories.length" class="flex gap-1.5 mb-5 flex-wrap">
        <button
          @click="activeCategory = ''"
          class="px-3 py-1 rounded-full text-xs font-medium transition"
          :class="!activeCategory ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'"
        >
          全部
        </button>
        <button
          v-for="cat in notesStore.categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="px-3 py-1 rounded-full text-xs font-medium transition"
          :class="activeCategory === cat.id ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'"
        >
          {{ cat.icon }} {{ cat.name }}
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center min-h-[300px]">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-zinc-200 border-t-zinc-500 rounded-full animate-spin mx-auto mb-4" />
          <p class="text-gray-400">加载中...</p>
        </div>
      </div>

      <template v-else>
        <div v-if="filteredPinned.length" class="mb-6">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">置顶</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
            <QuickNoteCard
              v-for="note in filteredPinned"
              :key="note.id"
              :note="note"
              :category-name="getCategoryName(note.categoryId)"
              @edit="openEditNote"
              @delete="onDeleteNote"
              @toggle-pin="onTogglePin"
            />
          </div>
        </div>

        <div v-if="filteredQuick.length" class="mb-6">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">便签</p>
          <QuickNotesGrid
            :notes="filteredQuick"
            @edit="openEditNote"
            @delete="onDeleteNote"
            @toggle-pin="onTogglePin"
          />
        </div>

        <div v-if="filteredFull.length">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">笔记</p>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FullNoteCard
              v-for="note in filteredFull"
              :key="note.id"
              :note="note"
              :category-name="getCategoryName(note.categoryId)"
              @edit="openEditNote"
              @delete="onDeleteNote"
              @toggle-pin="onTogglePin"
            />
          </div>
        </div>

        <div v-if="!filteredPinned.length && !filteredQuick.length && !filteredFull.length" class="flex items-center justify-center min-h-[300px]">
          <div class="text-center">
            <p class="text-gray-400 text-lg">暂无笔记</p>
            <p v-if="auth.isEditMode" class="text-gray-400 text-sm mt-2">点击「+ 新建笔记」开始记录</p>
          </div>
        </div>
      </template>
    </div>

    <NoteEditDialog
      :visible="noteDialogVisible"
      :note="editingNote"
      :categories="notesStore.categories"
      @close="noteDialogVisible = false"
      @save="onSaveNote"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotesStore } from '../../stores/notes.js'
import { useAuthStore } from '../../stores/auth.js'
import { fetchPrivateJson, savePrivateJson } from '../../services/github.js'
import QuickNoteCard from './QuickNoteCard.vue'
import FullNoteCard from './FullNoteCard.vue'
import QuickNotesGrid from './QuickNotesGrid.vue'
import NoteEditDialog from './NoteEditDialog.vue'

const NOTES_PATH = 'data/notes.json'

const notesStore = useNotesStore()
const auth = useAuthStore()

const loading = ref(true)
const search = ref('')
const activeCategory = ref('')
const noteDialogVisible = ref(false)
const editingNote = ref(null)

const filtered = computed(() => {
  let list = notesStore.notes
  if (activeCategory.value) {
    list = list.filter(n => n.categoryId === activeCategory.value)
  }
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags?.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

const filteredPinned = computed(() => filtered.value.filter(n => n.pinned))
const filteredQuick = computed(() => filtered.value.filter(n => !n.pinned && n.type === 'quick'))
const filteredFull = computed(() => filtered.value.filter(n => !n.pinned && n.type === 'full'))

function getCategoryName(catId) {
  const cat = notesStore.categories.find(c => c.id === catId)
  return cat ? `${cat.icon} ${cat.name}` : ''
}

function openNewNote() {
  editingNote.value = null
  noteDialogVisible.value = true
}

function openEditNote(note) {
  editingNote.value = note
  noteDialogVisible.value = true
}

function onSaveNote(form) {
  if (editingNote.value) {
    notesStore.updateNote(editingNote.value.id, form)
  } else {
    notesStore.addNote(form)
  }
  noteDialogVisible.value = false
  triggerSave()
}

function onDeleteNote(id) {
  if (confirm('确定要删除这条笔记吗？')) {
    notesStore.removeNote(id)
    triggerSave()
  }
}

function onTogglePin(id) {
  notesStore.togglePin(id)
  triggerSave()
}

async function loadNotes() {
  loading.value = true
  try {
    const result = await fetchPrivateJson(auth.pat, NOTES_PATH)
    notesStore.setData(result.data, result.sha)
  } catch (e) {
    if (e.message.includes('404')) {
      notesStore.setData({ notes: [], categories: [{ id: 'default', name: '默认', icon: '📝' }] }, null)
    }
  } finally {
    loading.value = false
  }
}

async function triggerSave() {
  if (!auth.pat) return
  try {
    let currentSha = notesStore.sha
    if (!currentSha) {
      try {
        const result = await fetchPrivateJson(auth.pat, NOTES_PATH)
        currentSha = result.sha
      } catch {
        currentSha = null
      }
    }
    notesStore.status = 'saving'
    const result = await savePrivateJson(auth.pat, NOTES_PATH, notesStore.toJSON(), currentSha)
    notesStore.sha = result.sha
    notesStore.status = 'idle'
  } catch (e) {
    notesStore.status = 'error'
    notesStore.lastError = e.message
  }
}

onMounted(loadNotes)
</script>
