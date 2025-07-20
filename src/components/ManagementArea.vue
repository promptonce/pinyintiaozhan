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
      <button
        class="btn btn-success add-word-btn"
        @click="addNewWord"
      >
        + 添加
      </button>
    </div>
    
    <div class="vocabulary-list">
      <table>
        <thead>
          <tr>
            <th>词语</th>
            <th>拼音</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="word in vocabulary" :key="word.id">
            <td>{{ word.hanzi }}</td>
            <td>{{ word.pinyin }}</td>
            <td>
              <span :class="word.isMastered ? 'mastered' : 'practicing'">
                {{ word.isMastered ? '已掌握' : '练习中' }}
              </span>
            </td>
            <td class="actions">
              <button @click="editWord(word)">编辑</button>
              <button @click="confirmDelete(word.id)">删除</button>
            </td>
          </tr>
          <tr v-if="vocabulary.length === 0">
            <td colspan="4" class="empty-message">词库为空</td>
          </tr>
        </tbody>
      </table>
    </div>
    
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

    <!-- 编辑模态框 -->
    <div v-if="editingWord" class="modal-overlay">
      <div class="modal">
        <h3>编辑词语</h3>
        <div class="input-group">
          <input
            v-model="editHanzi"
            type="text"
            placeholder="中文词语"
          />
          <input
            v-model="editPinyin"
            type="text"
            placeholder="连续拼音"
          />
        </div>
        <div class="checkbox-group">
          <label>
            <input
              type="checkbox"
              v-model="editIsMastered"
            />
            标记为已掌握
          </label>
        </div>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="cancelEdit">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useVocabulary } from '../composables/useVocabulary'

const {
  newHanzi,
  newPinyin,
  vocabulary,
  addWord,
  deleteWord,
  updateWord,
  importFromFile,
  exportToFile
} = useVocabulary()

const editingWord = ref(null)
const editHanzi = ref('')
const editPinyin = ref('')
const editIsMastered = ref(false)

const editWord = (word) => {
  editingWord.value = word
  editHanzi.value = word.hanzi
  editPinyin.value = word.pinyin
  editIsMastered.value = word.isMastered
}

const saveEdit = () => {
  if (!editHanzi.value || !editPinyin.value) {
    alert('词语和拼音不能为空！')
    return
  }

  updateWord(editingWord.value.id, {
    hanzi: editHanzi.value.trim(),
    pinyin: editPinyin.value.toLowerCase().trim(),
    isMastered: editIsMastered.value
  })
  editingWord.value = null
}

const cancelEdit = () => {
  editingWord.value = null
}

const confirmDelete = (id) => {
  if (confirm('确定要删除这个词语吗？')) {
    deleteWord(id)
  }
}

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

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.add-word-btn {
  padding: 10px 15px;
}

.vocabulary-list {
  margin: 20px 0;
  max-height: 400px;
  overflow-y: auto;
}

.vocabulary-list table {
  width: 100%;
  border-collapse: collapse;
}

.vocabulary-list th, .vocabulary-list td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.vocabulary-list th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.mastered {
  color: #4CAF50;
}

.practicing {
  color: #FF9800;
}

.actions button {
  margin-right: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:first-child {
  background-color: #2196F3;
  color: white;
}

.actions button:last-child {
  background-color: #f44336;
  color: white;
}

.empty-message {
  text-align: center;
  color: #777;
  padding: 20px;
}

.button-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
}

.modal .input-group {
  margin-bottom: 15px;
}

.checkbox-group {
  margin-bottom: 15px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
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