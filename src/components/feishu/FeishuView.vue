<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">飞书文档</h2>
        <p class="text-sm text-gray-400 dark:text-zinc-500 mt-1">快速访问你的飞书页面</p>
      </div>
      <button
        v-if="isEditMode"
        @click="showAddDialog = true"
        class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition"
      >
        + 添加页面
      </button>
    </div>

    <div v-if="feishuPages.length === 0" class="flex items-center justify-center min-h-[300px]">
      <div class="text-center">
        <p class="text-4xl mb-4">📄</p>
        <p class="text-gray-500 dark:text-zinc-400 text-lg mb-2">还没有添加飞书页面</p>
        <p v-if="isEditMode" class="text-gray-400 dark:text-zinc-500 text-sm mb-4">点击上方按钮添加你的飞书文档链接</p>
        <p v-else class="text-gray-400 dark:text-zinc-500 text-sm">登录后编辑模式可添加飞书页面</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="page in feishuPages"
        :key="page.id"
        class="group relative rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
      >
        <a
          :href="page.url"
          target="_blank"
          rel="noopener noreferrer"
          class="block p-5"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zm-4.63-1.37c-.14-.46-.68-.87-1.37-.87H12.5c-.69 0-1.23.41-1.37.87l-.93 3.13c-.14.46.14.87.83.87h1.38l-1.66 5.5c-.14.46.46.69.83.23l4.55-5.73h-1.38l2.62-3.99z"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ page.name }}</h3>
              <p class="text-xs text-gray-400 dark:text-zinc-500 truncate mt-1">{{ page.url }}</p>
            </div>
          </div>
        </a>

        <div v-if="isEditMode" class="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
          <button
            @click="editPage(page)"
            class="p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
          >
            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button
            @click="removePage(page.id)"
            class="p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
          >
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddDialog" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="closeDialog">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-zinc-700">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ editingPage ? '编辑页面' : '添加飞书页面' }}
            </h3>
            <button @click="closeDialog" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
          </div>
          <form @submit.prevent="savePage" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">页面名称</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                placeholder="如：产品需求文档"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">飞书链接</label>
              <input
                v-model="form.url"
                type="url"
                required
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                placeholder="https://xxx.feishu.cn/docx/..."
              />
              <p class="text-xs text-gray-400 dark:text-zinc-500 mt-1">粘贴飞书文档的分享链接</p>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="closeDialog" class="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">取消</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition">保存</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookmarksStore } from '../../stores/bookmarks.js'
import { useAuthStore } from '../../stores/auth.js'
import { genId } from '../../utils/id.js'

const bookmarksStore = useBookmarksStore()
const auth = useAuthStore()

const isEditMode = computed(() => auth.isEditMode)

const feishuPages = computed(() =>
  bookmarksStore.settings.feishuPages || []
)

const showAddDialog = ref(false)
const editingPage = ref(null)
const form = ref({ name: '', url: '' })

function editPage(page) {
  editingPage.value = page
  form.value = { name: page.name, url: page.url }
  showAddDialog.value = true
}

function closeDialog() {
  showAddDialog.value = false
  editingPage.value = null
  form.value = { name: '', url: '' }
}

function savePage() {
  const pages = [...(bookmarksStore.settings.feishuPages || [])]
  if (editingPage.value) {
    const idx = pages.findIndex(p => p.id === editingPage.value.id)
    if (idx !== -1) {
      pages[idx] = { ...pages[idx], name: form.value.name, url: form.value.url }
    }
  } else {
    pages.push({ id: genId(), name: form.value.name, url: form.value.url })
  }
  bookmarksStore.settings.feishuPages = pages
  bookmarksStore.markDirty()
  closeDialog()
}

function removePage(id) {
  if (!confirm('确定要移除这个飞书页面吗？')) return
  const pages = (bookmarksStore.settings.feishuPages || []).filter(p => p.id !== id)
  bookmarksStore.settings.feishuPages = pages
  bookmarksStore.markDirty()
}
</script>
