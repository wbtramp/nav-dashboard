import { ref } from 'vue'
import { uploadImage } from '../services/github.js'
import { useAuthStore } from '../stores/auth.js'

export function useImageUpload() {
  const auth = useAuthStore()
  const uploading = ref(false)
  const uploadError = ref('')

  async function upload(file) {
    uploading.value = true
    uploadError.value = ''
    try {
      const url = await uploadImage(auth.pat, file)
      return url
    } catch (e) {
      uploadError.value = e.message
      throw e
    } finally {
      uploading.value = false
    }
  }

  function triggerFileSelect() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => {
        const file = input.files?.[0]
        if (file) resolve(file)
        else resolve(null)
      }
      input.click()
    })
  }

  return { uploading, uploadError, upload, triggerFileSelect }
}
