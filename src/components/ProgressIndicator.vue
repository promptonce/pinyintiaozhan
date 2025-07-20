<template>
  <div id="progress-indicator">
    {{ progressText }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useVocabularyStore } from '../stores/vocabularyStore'

const store = useVocabularyStore()

const progressText = computed(() => {
  const totalCount = store.vocabulary.length
  const masteredCount = store.masteredCount
  const practiceCount = totalCount - masteredCount
  
  if (totalCount > 0) {
    return `练习中: ${practiceCount} | 已掌握: ${masteredCount} | 总计: ${totalCount}`
  } else {
    return '词库为空'
  }
})
</script>

<style scoped>
#progress-indicator {
  font-size: 0.9rem;
  color: var(--secondary-color);
  text-align: right;
}
</style>