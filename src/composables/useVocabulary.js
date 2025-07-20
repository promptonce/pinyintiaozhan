import { ref } from 'vue'
import { useVocabularyStore } from '../stores/vocabularyStore'

export function useVocabulary() {
  const store = useVocabularyStore()
  
  const newHanzi = ref('')
  const newPinyin = ref('')

  function addWord() {
    const hanzi = newHanzi.value.trim()
    const pinyin = newPinyin.value.toLowerCase().trim()
    
    if (!hanzi || !pinyin) {
      alert('词语和拼音不能为空！')
      return false
    }
    
    if (!/^[a-z]+$/.test(pinyin)) {
      alert('拼音格式错误！')
      return false
    }

    store.addWord({ hanzi, pinyin })
    alert(`新词 "${hanzi}" 已添加！`)
    return true
  }

  function importFromFile(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (Array.isArray(data) && data.every(item => item.hanzi && item.pinyin)) {
          store.importVocabulary(data)
          alert(`词库导入成功！共 ${data.length} 词。`)
        } else {
          throw new Error('JSON 格式不规范。')
        }
      } catch (error) {
        alert(`文件处理失败: ${error.message}`)
      }
    }
    
    reader.onerror = () => alert('读取文件错误。')
    reader.readAsText(file)
  }

  function exportToFile() {
    if (store.vocabulary.length === 0) {
      alert('词库为空。')
      return
    }

    const jsonString = JSON.stringify(store.vocabulary, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    
    a.href = url
    const date = new Date()
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    a.download = `Pinyin_Vocab_${dateString}.json`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    newHanzi,
    newPinyin,
    addWord,
    importFromFile,
    exportToFile
  }
}