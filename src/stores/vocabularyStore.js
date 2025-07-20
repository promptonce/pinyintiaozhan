import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVocabularyStore = defineStore('vocabulary', () => {
  // 状态
  const vocabulary = ref([])
  const practiceQueue = ref([])
  const currentWordIndex = ref(0)

  // 配置常量
  const MASTERY_CONFIG = {
    CONSECUTIVE_CORRECT_TARGET: 3,
    TIME_LIMIT_MS: 2500
  }

  // 计算属性
  const masteredCount = computed(() => 
    vocabulary.value.filter(word => word.isMastered).length
  )

  const currentPracticeWord = computed(() => {
    if (practiceQueue.value.length === 0) return null
    if (currentWordIndex.value >= practiceQueue.value.length) {
      currentWordIndex.value = 0
    }
    return practiceQueue.value[currentWordIndex.value]
  })

  // 工具函数
  function normalizeWord(word) {
    return {
      id: word.id || Date.now() + Math.random(),
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      isMastered: word.isMastered || false,
      consecutiveCorrect: word.consecutiveCorrect || 0,
      history: word.history || []
    }
  }

  function preparePracticeQueue() {
    practiceQueue.value = vocabulary.value
      .filter(word => !word.isMastered)
      .sort(() => Math.random() - 0.5)
    currentWordIndex.value = 0
  }

  // 动作
  function addWord(wordData) {
    const newWord = normalizeWord(wordData)
    vocabulary.value.push(newWord)
    
    // 如果还没掌握，加入练习队列
    if (!newWord.isMastered) {
      practiceQueue.value.push(newWord)
    }
  }

  function importVocabulary(data) {
    const newWords = data.map(normalizeWord);
    let addedCount = 0;
    
    // 合并新词汇，避免重复
    newWords.forEach(newWord => {
      const exists = vocabulary.value.some(existing => 
        existing.hanzi === newWord.hanzi && existing.pinyin === newWord.pinyin
      );
      
      if (!exists) {
        vocabulary.value.push(newWord);
        addedCount++;
      }
    });
    
    preparePracticeQueue();
    return addedCount;
  }

  function submitCorrectAnswer(wordId, timeTaken) {
    const word = vocabulary.value.find(w => w.id === wordId)
    if (!word) return { isMastered: false }

    word.consecutiveCorrect++
    word.history.push({ timeTaken, timestamp: Date.now() })

    let isMastered = false
    if (word.consecutiveCorrect >= MASTERY_CONFIG.CONSECUTIVE_CORRECT_TARGET && 
        timeTaken <= MASTERY_CONFIG.TIME_LIMIT_MS) {
      word.isMastered = true
      isMastered = true
      
      // 从练习队列中移除
      const queueIndex = practiceQueue.value.findIndex(w => w.id === wordId)
      if (queueIndex !== -1) {
        practiceQueue.value.splice(queueIndex, 1)
        // 调整当前索引
        if (currentWordIndex.value >= practiceQueue.value.length && practiceQueue.value.length > 0) {
          currentWordIndex.value = 0
        }
      }
    } else {
      // 移到下一个词
      currentWordIndex.value++
      if (currentWordIndex.value >= practiceQueue.value.length) {
        currentWordIndex.value = 0
      }
    }

    return { isMastered }
  }

  function submitWrongAnswer(wordId) {
    const word = vocabulary.value.find(w => w.id === wordId)
    if (word) {
      word.consecutiveCorrect = 0
    }
  }

  function deleteWord(wordId) {
    // 从词汇库中删除
    const vocabIndex = vocabulary.value.findIndex(w => w.id === wordId)
    if (vocabIndex !== -1) {
      vocabulary.value.splice(vocabIndex, 1)
    }

    // 从练习队列中删除
    const queueIndex = practiceQueue.value.findIndex(w => w.id === wordId)
    if (queueIndex !== -1) {
      practiceQueue.value.splice(queueIndex, 1)
      // 调整当前索引
      if (currentWordIndex.value >= practiceQueue.value.length && practiceQueue.value.length > 0) {
        currentWordIndex.value = 0
      }
    }
  }

  function updateWord(wordId, updates) {
    const word = vocabulary.value.find(w => w.id === wordId)
    if (word) {
      Object.assign(word, updates)
      // 如果修改了是否掌握状态，重新准备练习队列
      if ('isMastered' in updates) {
        preparePracticeQueue()
      }
    }
  }

  // 初始化默认词库
  function initializeDefaultVocabulary() {
    const defaultVocab = [
      { "hanzi": "小鹤双拼", "pinyin": "xiaoheshuangpin" },
    ]
    
    if (vocabulary.value.length === 0) {
      vocabulary.value = defaultVocab.map(normalizeWord)
      preparePracticeQueue()
    }
  }

  return {
    // 状态
    vocabulary,
    practiceQueue,
    currentWordIndex,
    // 计算属性
    masteredCount,
    currentPracticeWord,
    // 动作
    addWord,
    importVocabulary,
    submitCorrectAnswer,
    submitWrongAnswer,
    deleteWord,
    updateWord,
    initializeDefaultVocabulary
  }
})