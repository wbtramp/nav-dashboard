import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref([])
  const categories = ref([])
  const sha = ref('')
  const status = ref('idle')
  const lastError = ref('')

  const allTags = computed(() => {
    const set = new Set()
    notes.value.forEach(n => n.tags?.forEach(t => set.add(t)))
    return [...set]
  })

  const pinnedNotes = computed(() => notes.value.filter(n => n.pinned))
  const unpinnedNotes = computed(() => notes.value.filter(n => !n.pinned))

  function setData(data, newSha) {
    notes.value = data.notes || []
    categories.value = data.categories || []
    sha.value = newSha || ''
    status.value = 'idle'
  }

  function toJSON() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      notes: notes.value,
      categories: categories.value,
    }
  }

  function addNote(form) {
    const note = {
      id: crypto.randomUUID(),
      title: form.title || '无标题',
      content: form.content || '',
      type: form.type || 'quick',
      categoryId: form.categoryId || '',
      tags: form.tags || [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    notes.value.unshift(note)
    status.value = 'dirty'
    return note
  }

  function updateNote(id, form) {
    const note = notes.value.find(n => n.id === id)
    if (!note) return
    Object.assign(note, {
      title: form.title,
      content: form.content,
      type: form.type,
      categoryId: form.categoryId,
      tags: form.tags,
      updatedAt: new Date().toISOString(),
    })
    status.value = 'dirty'
  }

  function removeNote(id) {
    notes.value = notes.value.filter(n => n.id !== id)
    status.value = 'dirty'
  }

  function togglePin(id) {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      note.pinned = !note.pinned
      status.value = 'dirty'
    }
  }

  function addCategory(form) {
    categories.value.push({
      id: crypto.randomUUID(),
      name: form.name,
      icon: form.icon || '',
    })
    status.value = 'dirty'
  }

  function updateCategory(id, form) {
    const cat = categories.value.find(c => c.id === id)
    if (cat) {
      cat.name = form.name
      cat.icon = form.icon || ''
      status.value = 'dirty'
    }
  }

  function removeCategory(id) {
    categories.value = categories.value.filter(c => c.id !== id)
    notes.value.forEach(n => { if (n.categoryId === id) n.categoryId = '' })
    status.value = 'dirty'
  }

  return {
    notes, categories, sha, status, lastError,
    allTags, pinnedNotes, unpinnedNotes,
    setData, toJSON,
    addNote, updateNote, removeNote, togglePin,
    addCategory, updateCategory, removeCategory,
  }
})
