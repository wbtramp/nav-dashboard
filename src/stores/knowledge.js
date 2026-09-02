import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useKnowledgeStore = defineStore('knowledge', () => {
  const entries = ref([])
  const indexSha = ref('')
  const status = ref('idle')
  const lastError = ref('')
  const fileCache = ref({})

  const allTags = computed(() => {
    const set = new Set()
    entries.value.forEach(e => e.tags?.forEach(t => set.add(t)))
    return [...set]
  })

  const allCategories = computed(() => {
    const set = new Set()
    entries.value.forEach(e => { if (e.category) set.add(e.category) })
    return [...set]
  })

  function setData(data, newSha) {
    entries.value = data.entries || []
    indexSha.value = newSha || ''
    status.value = 'idle'
  }

  function toIndexJSON() {
    return { entries: entries.value }
  }

  function addEntry(form) {
    const slug = form.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
    const filename = `${slug}.md`
    const path = `knowledge/${form.category || '未分类'}/${filename}`
    const entry = {
      id: crypto.randomUUID(),
      title: form.title,
      path,
      category: form.category || '未分类',
      tags: form.tags || [],
      summary: form.summary || '',
      updatedAt: new Date().toISOString(),
    }
    entries.value.unshift(entry)
    fileCache.value[path] = { content: form.content || '', sha: null, isNew: true }
    status.value = 'dirty'
    return entry
  }

  function updateEntry(id, form) {
    const entry = entries.value.find(e => e.id === id)
    if (!entry) return
    if (form.content !== undefined) {
      const cached = fileCache.value[entry.path]
      fileCache.value[entry.path] = { ...cached, content: form.content, sha: cached?.sha || null }
    }
    entry.title = form.title ?? entry.title
    entry.category = form.category ?? entry.category
    entry.tags = form.tags ?? entry.tags
    entry.summary = form.summary ?? entry.summary
    entry.updatedAt = new Date().toISOString()
    status.value = 'dirty'
  }

  function removeEntry(id) {
    const entry = entries.value.find(e => e.id === id)
    if (entry) {
      delete fileCache.value[entry.path]
    }
    entries.value = entries.value.filter(e => e.id !== id)
    status.value = 'dirty'
  }

  function setFileContent(path, content, sha) {
    fileCache.value[path] = { content, sha }
  }

  function getFileContent(path) {
    return fileCache.value[path]?.content || null
  }

  function getFileSha(path) {
    return fileCache.value[path]?.sha || null
  }

  return {
    entries, indexSha, status, lastError, fileCache,
    allTags, allCategories,
    setData, toIndexJSON,
    addEntry, updateEntry, removeEntry,
    setFileContent, getFileContent, getFileSha,
  }
})
