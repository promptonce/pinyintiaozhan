<template>
  <div class="practice-area">
    <div id="hanzi-display" :class="{ empty: !currentWord }">
      {{ currentWord?.hanzi || '开始练习' }}
    </div>
    
    <div class="feedback-area">
      <div id="notification" v-if="notificationMessage">
        {{ notificationMessage }}
      </div>
    </div>
    
    <input
      v-model="userInput"
      type="text"
      id="pinyin-input"
      :class="{ error: showError }"
      :placeholder="inputPlaceholder"
      :disabled="isInputDisabled"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @keydown.enter="checkInput"
      @input="handleInput"
    />
    
    <div class="input-options">
      <select v-model="selectedScheme" id="input-scheme-select">
        <option value="quanpin">全拼</option>
        <option
          v-for="(schema, key) in shuangpinSchemas"
          :key="key"
          :value="key"
        >
          {{ schema.name }}
        </option>
      </select>
      
      <ProgressIndicator />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePractice } from '../composables/usePractice'
import { useShuangpinConverter } from '../composables/useShuangpinConverter'
import { useVocabularyStore } from '../stores/vocabularyStore'
import { storeToRefs } from 'pinia'
import ProgressIndicator from './ProgressIndicator.vue'

const {
  currentWord,
  userInput,
  showError,
  notificationMessage,
  isInputDisabled,
  inputPlaceholder,
  checkInput,
  handleInput
} = usePractice()

const store = useVocabularyStore()
const { shuangpinSchemas } = useShuangpinConverter()
const { selectedScheme } = storeToRefs(store)

onMounted(() => {
  // 自动聚焦输入框
  document.getElementById('pinyin-input')?.focus()
})
</script>

<style scoped>
.practice-area {
  text-align: center;
  margin-bottom: 30px;
}

#hanzi-display {
  font-size: 4rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 15px;
  min-height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--light-grey);
  border-radius: var(--border-radius);
  padding: 10px;
}

#hanzi-display.empty {
  color: var(--secondary-color);
}

.feedback-area {
  min-height: 1.2em;
  margin-top: 8px;
}

#notification {
  font-size: 0.9rem;
  color: var(--success-color);
  font-weight: bold;
}

#pinyin-input {
  width: 100%;
  padding: 12px;
  font-size: 1.2rem;
  border-radius: var(--border-radius);
  border: 2px solid var(--secondary-color);
  box-sizing: border-box;
  text-align: center;
  transition: border-color 0.3s, transform 0.1s;
}

#pinyin-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

#pinyin-input.error {
  border-color: var(--error-color);
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}

.input-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 0 5px;
}

#input-scheme-select {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}
</style>