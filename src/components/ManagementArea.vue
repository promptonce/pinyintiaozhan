<template>
  <div class="management-area">
    <h2>词库管理</h2>
    
    <div class="input-group">
      <input
        v-model="newHanzi"
        type="text"
        placeholder="中文词语 (例如: 支持)"
      />
      <input
        v-model="newPinyin"
        type="text"
        placeholder="连续拼音 (例如: zhichi)"
      />
    </div>
    
    <button
      class="btn btn-success add-word-btn"
      @click="addNewWord"
    >
      + 添加新词到队列
    </button>
    
    <div class="button-group">
      <button class="btn btn-secondary" @click="triggerImport">
        导入 JSON 词库
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleFileImport"
      />
      <button class="btn btn-primary" @click="exportVocabulary">
        导出当前词库
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useVocabulary } from '../composables/useVocabulary'

const {
  newHanzi,
  newPinyin,
  addWord,
  importFromFile,
  exportToFile
} = useVocabulary()

const fileInput = ref(null)

const addNewWord = () => {
  if (addWord()) {
    // 清空输入框
    newHanzi.value = ''
    newPinyin.value = ''
  }
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileImport = (event) => {
  importFromFile(event)
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const exportVocabulary = () => {
  exportToFile()
}
</script>

<style scoped>
.management-area {
  border-top: 2px solid var(--light-grey);
  padding-top: 25px;
}

h2 {
  font-size: 1.5rem;
  color: var(--secondary-color);
  text-align: center;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.input-group input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.add-word-btn {
  width: 100%;
  margin-bottom: 20px;
}

.button-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.btn {
  padding: 12px 15px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-success {
  background-color: var(--success-color);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>