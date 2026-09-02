<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
    <QuickNoteCard
      v-for="note in notes"
      :key="note.id"
      :note="note"
      :category-name="getCategoryName(note.categoryId)"
      @edit="$emit('edit', note)"
      @delete="$emit('delete', note.id)"
      @toggle-pin="$emit('toggle-pin', note.id)"
    />
  </div>
</template>

<script setup>
import QuickNoteCard from './QuickNoteCard.vue'

defineProps({ notes: { type: Array, default: () => [] } })
defineEmits(['edit', 'delete', 'toggle-pin'])

function getCategoryName(catId) {
  return ''
}
</script>
