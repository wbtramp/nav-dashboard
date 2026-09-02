import { watch } from 'vue'
import { useBookmarksStore } from '../stores/bookmarks.js'
import { useAuthStore } from '../stores/auth.js'
import { saveBookmarks, fetchBookmarks } from '../services/github.js'

export function useAutoSave() {
  const bookmarksStore = useBookmarksStore()
  const authStore = useAuthStore()
  let timer = null
  let saving = false

  async function save() {
    if (saving || !authStore.isEditMode || !authStore.pat) return
    if (bookmarksStore.status !== 'dirty') return

    saving.value = true
    bookmarksStore.status = 'saving'

    try {
      let currentSha = bookmarksStore.sha
      if (!currentSha) {
        const result = await fetchBookmarks(authStore.pat)
        currentSha = result.sha
      }

      const result = await saveBookmarks(authStore.pat, bookmarksStore.toJSON(), currentSha)
      bookmarksStore.sha = result.sha
      bookmarksStore.status = 'idle'
    } catch (e) {
      if (e.message === 'CONFLICT') {
        bookmarksStore.status = 'conflict'
      } else {
        bookmarksStore.status = 'error'
        bookmarksStore.lastError = e.message
      }
    } finally {
      saving = false
    }
  }

  watch(
    () => bookmarksStore.status,
    (s) => {
      if (s === 'dirty' && authStore.isEditMode) {
        clearTimeout(timer)
        timer = setTimeout(save, 1500)
      }
    }
  )

  window.addEventListener('beforeunload', (e) => {
    if (bookmarksStore.status === 'dirty') {
      e.preventDefault()
    }
  })

  return { save }
}
