import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { verifyToken } from '../services/github.js'
import { OWNER_LOGIN } from '../config.js'

const PAT_KEY = 'nav.pat'

export const useAuthStore = defineStore('auth', () => {
  const pat = ref(localStorage.getItem(PAT_KEY) || '')
  const login = ref('')
  const loading = ref(false)
  const error = ref('')

  const isOwner = computed(() => login.value.toLowerCase() === OWNER_LOGIN.toLowerCase())
  const isEditMode = ref(false)
  const isLoggedIn = computed(() => !!login.value)

  async function loginWithPat(token) {
    loading.value = true
    error.value = ''
    try {
      const userLogin = await verifyToken(token)
      pat.value = token
      login.value = userLogin
      localStorage.setItem(PAT_KEY, token)
      if (isOwner.value) {
        isEditMode.value = true
      }
    } catch (e) {
      error.value = 'Token 验证失败，请检查后重试'
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    pat.value = ''
    login.value = ''
    isEditMode.value = false
    localStorage.removeItem(PAT_KEY)
  }

  function toggleEditMode() {
    if (isOwner.value) {
      isEditMode.value = !isEditMode.value
    }
  }

  async function restoreSession() {
    const stored = localStorage.getItem(PAT_KEY)
    if (!stored) return
    try {
      const userLogin = await verifyToken(stored)
      pat.value = stored
      login.value = userLogin
    } catch {
      localStorage.removeItem(PAT_KEY)
    }
  }

  return {
    pat, login, loading, error,
    isOwner, isEditMode, isLoggedIn,
    loginWithPat, logout, toggleEditMode, restoreSession,
  }
})
