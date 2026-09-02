<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-zinc-700">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ entry ? '编辑资料' : '新建资料' }}
          </h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>

        <div class="px-6 py-4 flex-1 overflow-y-auto space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              placeholder="资料标题"
            />
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">分类</label>
              <input
                v-model="form.category"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                placeholder="如：编程、工作、生活"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">摘要</label>
              <input
                v-model="form.summary"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                placeholder="简短描述"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标签</label>
            <input
              v-model="tagInput"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              placeholder="输入标签，逗号分隔"
              @keydown.enter.prevent="addTags"
            />
            <div class="flex gap-1 flex-wrap mt-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-400 flex items-center gap-1"
              >
                {{ tag }}
                <button @click="removeTag(tag)" class="hover:text-zinc-900 dark:hover:text-white">&times;</button>
              </span>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">内容 (Markdown)</label>
              <button
                type="button"
                @click="handleImageUpload"
                :disabled="uploading"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ uploading ? '上传中...' : '上传图片' }}
              </button>
            </div>
            <textarea
              ref="textareaRef"
              v-model="form.content"
              rows="12"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y"
              placeholder="Markdown 内容..."
            />
            <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-zinc-800">
          <button @click="$emit('close')" class="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
            取消
          </button>
          <button
            @click="handleSave"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useImageUpload } from '../../composables/useImageUpload.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  entry: { type: Object, default: null },
  content: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save'])

const { uploading, uploadError, upload, triggerFileSelect } = useImageUpload()
const textareaRef = ref(null)
const form = ref({ title: '', category: '', summary: '', tags: [], content: '' })
const tagInput = ref('')

watch(() => props.visible, (v) => {
  if (v) {
    if (props.entry) {
      form.value = {
        title: props.entry.title,
        category: props.entry.category || '',
        summary: props.entry.summary || '',
        tags: [...(props.entry.tags || [])],
        content: props.content || '',
      }
    } else {
      form.value = { title: '', category: '', summary: '', tags: [], content: '' }
    }
    tagInput.value = ''
  }
})

function addTags() {
  const tags = tagInput.value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
  tags.forEach(t => { if (!form.value.tags.includes(t)) form.value.tags.push(t) })
  tagInput.value = ''
}

function removeTag(tag) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

async function handleImageUpload() {
  const file = await triggerFileSelect()
  if (!file) return
  try {
    const url = await upload(file)
    const ta = textareaRef.value
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = form.value.content
    const imgMd = `![${file.name}](${url})`
    form.value.content = text.slice(0, start) + imgMd + text.slice(end)
  } catch {}
}

function handleSave() {
  emit('save', { ...form.value })
}
</script>
