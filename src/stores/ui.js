import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const THEME_KEY = 'nav.theme'
const BANNER_KEY = 'nav.bannerCollapsed'
const DEFAULT_ACCENT = '#863bff'

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function lightenHex(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export const useUiStore = defineStore('ui', () => {
  const searchQuery = ref('')
  const activeTags = ref([])
  const theme = ref(localStorage.getItem(THEME_KEY) || 'system')
  const activeModule = ref('navigation')
  const bannerCollapsed = ref(localStorage.getItem(BANNER_KEY) === 'true')
  const accentColor = ref(DEFAULT_ACCENT)

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

  function applyAccent(color) {
    const root = document.documentElement
    root.style.setProperty('--accent', color)
    root.style.setProperty('--accent-light', lightenHex(color, 32))
    root.style.setProperty('--accent-bg', hexToRgba(color, 0.08))
  }

  function setAccentColor(color) {
    accentColor.value = color
    applyAccent(color)
  }

  watch(theme, (t) => applyTheme(t), { immediate: true })

  return {
    searchQuery, activeTags, theme,
    activeModule, bannerCollapsed, accentColor,
    bookmarkDialog, categoryDialog, loginDialog,
    toggleTag, clearFilters, setTheme, toggleBanner, applyTheme,
    setAccentColor, applyAccent,
  }
})
