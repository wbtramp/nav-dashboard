import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUiStore } from './ui.js'
import { matchesQuery, matchesTags } from '../utils/search.js'
import { genId } from '../utils/id.js'

export const useBookmarksStore = defineStore('bookmarks', () => {
  const categories = ref([])
  const bookmarks = ref([])
  const settings = ref({ theme: 'system', title: 'Nav Dashboard' })
  const sha = ref(null)
  const status = ref('idle') // idle | loading | dirty | saving | error | conflict
  const lastError = ref('')

  const allTags = computed(() => {
    const map = new Map()
    bookmarks.value.forEach(b => {
      b.tags.forEach(t => map.set(t, (map.get(t) || 0) + 1))
    })
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  })

  const bookmarksByCategory = computed(() => {
    const map = new Map()
    categories.value.forEach(c => map.set(c.id, []))
    bookmarks.value.forEach(b => {
      const list = map.get(b.categoryId)
      if (list) list.push(b)
    })
    return map
  })

  const filteredBookmarks = computed(() => {
    const ui = useUiStore()
    return bookmarks.value.filter(b =>
      matchesQuery(b, ui.searchQuery) && matchesTags(b, ui.activeTags)
    )
  })

  const isFiltering = computed(() => {
    const ui = useUiStore()
    return !!ui.searchQuery || ui.activeTags.length > 0
  })

  function setData(data, fileSha) {
    categories.value = data.categories || []
    bookmarks.value = data.bookmarks || []
    settings.value = data.settings || { theme: 'system', title: 'Nav Dashboard' }
    sha.value = fileSha
    status.value = 'idle'
  }

  function markDirty() {
    if (status.value !== 'saving') {
      status.value = 'dirty'
    }
  }

  function addBookmark(bm) {
    bookmarks.value.push({
      id: genId(),
      title: bm.title,
      url: bm.url,
      description: bm.description || '',
      categoryId: bm.categoryId,
      tags: bm.tags || [],
      icon: bm.icon || null,
      pinned: false,
      createdAt: new Date().toISOString(),
    })
    markDirty()
  }

  function updateBookmark(id, updates) {
    const idx = bookmarks.value.findIndex(b => b.id === id)
    if (idx !== -1) {
      bookmarks.value[idx] = { ...bookmarks.value[idx], ...updates }
      markDirty()
    }
  }

  function removeBookmark(id) {
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
    markDirty()
  }

  function moveBookmark(id, toCategoryId, toIndex) {
    const idx = bookmarks.value.findIndex(b => b.id === id)
    if (idx === -1) return
    const [bm] = bookmarks.value.splice(idx, 1)
    bm.categoryId = toCategoryId

    const categoryItems = bookmarks.value.filter(b => b.categoryId === toCategoryId)
    if (toIndex >= categoryItems.length) {
      bookmarks.value.push(bm)
    } else {
      const targetBm = categoryItems[toIndex]
      const targetIdx = bookmarks.value.indexOf(targetBm)
      bookmarks.value.splice(targetIdx, 0, bm)
    }
    markDirty()
  }

  function reorderInCategory(catId, idList) {
    const items = bookmarks.value.filter(b => b.categoryId === catId)
    const others = bookmarks.value.filter(b => b.categoryId !== catId)
    const reordered = idList.map(id => items.find(b => b.id === id)).filter(Boolean)
    const missing = items.filter(b => !idList.includes(b.id))
    bookmarks.value = [...others, ...reordered, ...missing]
    markDirty()
  }

  function addCategory(cat) {
    categories.value.push({
      id: genId(),
      name: cat.name,
      icon: cat.icon || '📁',
      collapsed: false,
    })
    markDirty()
  }

  function updateCategory(id, updates) {
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...updates }
      markDirty()
    }
  }

  function removeCategory(id) {
    const hasBookmarks = bookmarks.value.some(b => b.categoryId === id)
    if (hasBookmarks) return false
    categories.value = categories.value.filter(c => c.id !== id)
    markDirty()
    return true
  }

  function reorderCategories(newIdOrder) {
    const map = new Map(categories.value.map(c => [c.id, c]))
    categories.value = newIdOrder.map(id => map.get(id)).filter(Boolean)
    markDirty()
  }

  function toJSON() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      settings: settings.value,
      categories: categories.value,
      bookmarks: bookmarks.value,
    }
  }

  return {
    categories, bookmarks, settings, sha, status, lastError,
    allTags, bookmarksByCategory, filteredBookmarks, isFiltering,
    setData, markDirty, toJSON,
    addBookmark, updateBookmark, removeBookmark, moveBookmark, reorderInCategory,
    addCategory, updateCategory, removeCategory, reorderCategories,
  }
})
