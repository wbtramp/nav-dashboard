<template>
  <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 markdown-body" v-html="rendered" />
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: { type: String, default: '' },
})

const rendered = computed(() => {
  try {
    return marked(props.content || '', { breaks: true })
  } catch {
    return props.content || ''
  }
})
</script>

<style scoped>
.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
}
</style>
