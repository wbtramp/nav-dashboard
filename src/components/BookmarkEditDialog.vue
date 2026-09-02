<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-zinc-700">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ isEdit ? '编辑网址' : '添加网址' }}
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="onSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题 *</label>
            <input v-model="form.title" required class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">网址 *</label>
            <input v-model="form.url" type="url" required placeholder="https://" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">分类</label>
            <select v-model="form.categoryId" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标签</label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <span v-for="tag in form.tags" :key="tag" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">
                {{ tag }}
                <button type="button" @click="removeTag(tag)" class="hover:text-zinc-900 dark:hover:text-white">&times;</button>
              </span>
            </div>
            <input
              v-model="tagInput"
              @keydown.enter.prevent="addTag"
              @keydown.,="addTag"
              placeholder="输入标签后按回车或逗号添加"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
            <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none" />
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">取消</button>
            <button type="submit" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition">
              {{ isEdit ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  bookmark: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  defaultCategoryId: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.bookmark)

const form = ref(createEmptyForm())
const tagInput = ref('')

function createEmptyForm() {
  return {
    title: '',
    url: '',
    description: '',
    categoryId: props.defaultCategoryId || (props.categories[0]?.id ?? ''),
    tags: [],
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    if (props.bookmark) {
      form.value = {
        title: props.bookmark.title,
        url: props.bookmark.url,
        description: props.bookmark.description || '',
        categoryId: props.bookmark.categoryId,
        tags: [...props.bookmark.tags],
      }
    } else {
      form.value = createEmptyForm()
      if (props.defaultCategoryId) {
        form.value.categoryId = props.defaultCategoryId
      }
    }
    tagInput.value = ''
  }
})

function addTag() {
  const val = tagInput.value.trim().toLowerCase()
  if (val && !form.value.tags.includes(val)) {
    form.value.tags.push(val)
  }
  tagInput.value = ''
}

function removeTag(tag) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function onSubmit() {
  emit('save', { ...form.value })
}
</script>
