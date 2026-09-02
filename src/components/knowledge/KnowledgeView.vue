<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">资料库</h1>
          <p class="text-sm text-gray-400 mt-0.5">{{ knowledgeStore.entries.length }} 条资料</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <input
              v-model="search"
              type="text"
              placeholder="搜索资料..."
              class="w-48 pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <button
            v-if="auth.isEditMode"
            @click="openNewEntry"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition"
          >
            + 新建资料
          </button>
        </div>
      </div>

      <div v-if="knowledgeStore.allCategories.length" class="flex gap-1.5 mb-5 flex-wrap">
        <button
          @click="activeCategory = ''"
          class="px-3 py-1 rounded-full text-xs font-medium transition"
          :class="!activeCategory ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'"
        >
          全部
        </button>
        <button
          v-for="cat in knowledgeStore.allCategories"
          :key="cat"
          @click="activeCategory = cat"
          class="px-3 py-1 rounded-full text-xs font-medium transition"
          :class="activeCategory === cat ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center min-h-[300px]">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-zinc-200 border-t-zinc-500 rounded-full animate-spin mx-auto mb-4" />
          <p class="text-gray-400">加载中...</p>
        </div>
      </div>

      <template v-else>
        <div v-if="filteredEntries.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KnowledgeCard
            v-for="entry in filteredEntries"
            :key="entry.id"
            :entry="entry"
            @open="openViewer(entry)"
            @edit="openEditEntry(entry)"
            @delete="onDeleteEntry(entry.id)"
          />
        </div>

        <div v-else class="flex items-center justify-center min-h-[300px]">
          <div class="text-center">
            <p class="text-gray-400 text-lg">暂无资料</p>
            <p v-if="auth.isEditMode" class="text-gray-400 text-sm mt-2">点击「+ 新建资料」添加第一条</p>
          </div>
        </div>
      </template>
    </div>

    <KnowledgeEditDialog
      :visible="editDialogVisible"
      :entry="editingEntry"
      :content="editingContent"
      @close="editDialogVisible = false"
      @save="onSaveEntry"
    />

    <Teleport to="body">
      <div v-if="viewerVisible" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="viewerVisible = false">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-zinc-700">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ viewingEntry?.title }}</h2>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ viewingEntry?.category }}
                <span v-if="viewingEntry?.tags?.length" class="ml-2">
                  {{ viewingEntry.tags.join(', ') }}
                </span>
              </p>
            </div>
            <button @click="viewerVisible = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
          </div>
          <div class="px-6 py-5 flex-1 overflow-y-auto">
            <div v-if="viewerLoading" class="flex items-center justify-center py-12">
              <div class="w-6 h-6 border-3 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
            </div>
            <MarkdownViewer v-else :content="viewingContent" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { useAuthStore } from '../../stores/auth.js'
import { fetchPrivateJson, savePrivateJson, fetchPrivateFile, savePrivateFile } from '../../services/github.js'
import KnowledgeCard from './KnowledgeCard.vue'
import KnowledgeEditDialog from './KnowledgeEditDialog.vue'
import MarkdownViewer from './MarkdownViewer.vue'

const INDEX_PATH = 'knowledge/index.json'

const knowledgeStore = useKnowledgeStore()
const auth = useAuthStore()

const loading = ref(true)
const search = ref('')
const activeCategory = ref('')
const editDialogVisible = ref(false)
const editingEntry = ref(null)
const editingContent = ref('')

const viewerVisible = ref(false)
const viewingEntry = ref(null)
const viewingContent = ref('')
const viewerLoading = ref(false)

const filteredEntries = computed(() => {
  let list = knowledgeStore.entries
  if (activeCategory.value) {
    list = list.filter(e => e.category === activeCategory.value)
  }
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.summary?.toLowerCase().includes(q) ||
      e.tags?.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

function openNewEntry() {
  editingEntry.value = null
  editingContent.value = ''
  editDialogVisible.value = true
}

async function openEditEntry(entry) {
  editingEntry.value = entry
  try {
    const cached = knowledgeStore.getFileContent(entry.path)
    if (cached !== null) {
      editingContent.value = cached
    } else {
      const result = await fetchPrivateFile(auth.pat, entry.path)
      knowledgeStore.setFileContent(entry.path, result.content, result.sha)
      editingContent.value = result.content
    }
  } catch {
    editingContent.value = ''
  }
  editDialogVisible.value = true
}

async function openViewer(entry) {
  viewingEntry.value = entry
  viewerVisible.value = true
  viewerLoading.value = true
  try {
    const cached = knowledgeStore.getFileContent(entry.path)
    if (cached !== null) {
      viewingContent.value = cached
    } else {
      const result = await fetchPrivateFile(auth.pat, entry.path)
      knowledgeStore.setFileContent(entry.path, result.content, result.sha)
      viewingContent.value = result.content
    }
  } catch {
    viewingContent.value = '*文件加载失败*'
  } finally {
    viewerLoading.value = false
  }
}

function onSaveEntry(form) {
  if (editingEntry.value) {
    knowledgeStore.updateEntry(editingEntry.value.id, form)
  } else {
    knowledgeStore.addEntry(form)
  }
  editDialogVisible.value = false
  triggerSave()
}

function onDeleteEntry(id) {
  if (confirm('确定要删除这条资料吗？')) {
    knowledgeStore.removeEntry(id)
    triggerSave()
  }
}

async function triggerSave() {
  if (!auth.pat) return
  try {
    let currentSha = knowledgeStore.indexSha
    if (!currentSha) {
      try {
        const result = await fetchPrivateJson(auth.pat, INDEX_PATH)
        currentSha = result.sha
      } catch {
        currentSha = null
      }
    }
    knowledgeStore.status = 'saving'

    const fileOps = Object.entries(knowledgeStore.fileCache).filter(([, v]) => v.content !== undefined)
    for (const [path, val] of fileOps) {
      const newSha = await savePrivateFile(auth.pat, path, val.content, val.sha)
      knowledgeStore.setFileContent(path, val.content, newSha.sha)
    }

    const result = await savePrivateJson(auth.pat, INDEX_PATH, knowledgeStore.toIndexJSON(), currentSha)
    knowledgeStore.indexSha = result.sha
    knowledgeStore.status = 'idle'
  } catch (e) {
    knowledgeStore.status = 'error'
    knowledgeStore.lastError = e.message
  }
}

async function loadIndex() {
  loading.value = true
  try {
    const result = await fetchPrivateJson(auth.pat, INDEX_PATH)
    knowledgeStore.setData(result.data, result.sha)
  } catch (e) {
    if (e.message.includes('404')) {
      knowledgeStore.setData({ entries: [] }, null)
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadIndex)
</script>
