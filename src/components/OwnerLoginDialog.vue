<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-zinc-700">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Owner 登录</h3>
          <button @click="$emit('close')" class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="onSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub Personal Access Token
            </label>
            <input
              v-model="token"
              type="password"
              required
              placeholder="ghp_xxxxxxxxxxxx"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            <p class="text-xs text-gray-400 mt-1.5">
              创建 Fine-grained Token，仅授予本仓库 Contents 读写权限。
              <a href="https://github.com/settings/tokens?type=beta" target="_blank" class="text-zinc-600 dark:text-zinc-300 hover:underline">去创建 →</a>
            </p>
          </div>

          <p v-if="error" class="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{{ error }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">取消</button>
            <button type="submit" :disabled="loading" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 transition">
              {{ loading ? '验证中...' : '登录' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

const auth = useAuthStore()
const token = ref('')
const error = ref('')
const loading = ref(false)

watch(() => props.visible, (v) => {
  if (v) {
    token.value = ''
    error.value = ''
  }
})

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.loginWithPat(token.value)
    emit('close')
  } catch (e) {
    error.value = auth.error || '验证失败'
  } finally {
    loading.value = false
  }
}
</script>
