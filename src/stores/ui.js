import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const THEME_KEY = 'nav.theme'
const BANNER_KEY = 'nav.bannerCollapsed'

export const useUiStore = defineStore('ui', () => {
  const searchQuery = ref('')
  const activeTags = ref([])
  const theme = ref(localStorage.getItem(THEME_KEY) || 'system')
  const activeModule = ref('navigation')
  const bannerCollapsed = ref(localStorage.getItem(BANNER_KEY) === 'true')

  const bookmarkDialog = ref({ open: false, editingId: null })
  const categoryDialog = ref({ open: false, editingId: null })
  const loginDialog = ref(false)

  function toggleTag(tag) {
    const idx = activeTags.value.indexOf(tag)
    if (idx === -1) {
      activeTags.value.push(tag)
    } else {
      activeTags.value.splice(idx, 1)
    }
  }

  function clearFilters() {
    searchQuery.value = ''
    activeTags.value = []
  }

  function setTheme(t) {
    theme.value = t
    localStorage.setItem(THEME_KEY, t)
    applyTheme(t)
  }

  function toggleBanner() {
    bannerCollapsed.value = !bannerCollapsed.value
    localStorage.setItem(BANNER_KEY, bannerCollapsed.value)
  }

  function applyTheme(t) {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else if (t === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
  }

  watch(theme, (t) => applyTheme(t), { immediate: true })

  return {
    searchQuery, activeTags, theme,
    activeModule, bannerCollapsed,
    bookmarkDialog, categoryDialog, loginDialog,
    toggleTag, clearFilters, setTheme, toggleBanner, applyTheme,
  }
})
