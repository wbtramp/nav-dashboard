<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-zinc-700">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ note ? '编辑笔记' : '新建笔记' }}
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
              placeholder="笔记标题"
            />
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">类型</label>
              <select
                v-model="form.type"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="quick">便签</option>
                <option value="full">笔记</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">分类</label>
              <select
                v-model="form.categoryId"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="">无分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">内容</label>
            <textarea
              v-model="form.content"
              rows="10"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y"
              placeholder="支持 Markdown 语法..."
            />
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

const props = defineProps({
  visible: { type: Boolean, default: false },
  note: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'save'])

const form = ref({ title: '', content: '', type: 'quick', categoryId: '', tags: [] })
const tagInput = ref('')

watch(() => props.visible, (v) => {
  if (v) {
    if (props.note) {
      form.value = {
        title: props.note.title,
        content: props.note.content,
        type: props.note.type,
        categoryId: props.note.categoryId || '',
        tags: [...(props.note.tags || [])],
      }
    } else {
      form.value = { title: '', content: '', type: 'quick', categoryId: '', tags: [] }
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

function handleSave() {
  emit('save', { ...form.value })
}
</script>
