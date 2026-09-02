import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { verifyToken } from '../services/github.js'
import { OWNER_LOGIN } from '../config.js'

const PAT_KEY = 'nav.pat'
const LOGIN_KEY = 'nav.login'

export const useAuthStore = defineStore('auth', () => {
  const pat = ref(localStorage.getItem(PAT_KEY) || '')
  const login = ref(localStorage.getItem(LOGIN_KEY) || '')
  const loading = ref(false)
  const error = ref('')

  const isOwner = computed(() => login.value.toLowerCase() === OWNER_LOGIN.toLowerCase())
  const isEditMode = ref(!!pat.value && isOwner.value)
  const isLoggedIn = computed(() => !!login.value)

  async function loginWithPat(token) {
    loading.value = true
    error.value = ''
    try {
      const userLogin = await verifyToken(token)
      pat.value = token
      login.value = userLogin
      localStorage.setItem(PAT_KEY, token)
      localStorage.setItem(LOGIN_KEY, userLogin)
      if (OWNER_LOGIN.toLowerCase() === userLogin.toLowerCase()) {
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
    localStorage.removeItem(LOGIN_KEY)
  }

  function toggleEditMode() {
    if (isOwner.value) {
      isEditMode.value = !isEditMode.value
    }
  }

  async function restoreSession() {
    const storedPat = localStorage.getItem(PAT_KEY)
    const storedLogin = localStorage.getItem(LOGIN_KEY)
    if (storedPat && storedLogin) {
      pat.value = storedPat
      login.value = storedLogin
      if (OWNER_LOGIN.toLowerCase() === storedLogin.toLowerCase()) {
        isEditMode.value = true
      }
    }
  }

  return {
    pat, login, loading, error,
    isOwner, isEditMode, isLoggedIn,
    loginWithPat, logout, toggleEditMode, restoreSession,
  }
})
