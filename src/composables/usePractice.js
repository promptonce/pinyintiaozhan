import { ref, computed, watch } from 'vue'
import { useVocabularyStore } from '../stores/vocabularyStore'
import { useShuangpinConverter } from './useShuangpinConverter'

export function usePractice() {
  const store = useVocabularyStore()
  const { selectedScheme, toShuangpin } = useShuangpinConverter()
  
  const userInput = ref('')
  const showError = ref(false)
  const notificationMessage = ref('')
  const wordStartTime = ref(0)
  
  let notificationTimeout = null

  const currentWord = computed(() => store.currentPracticeWord)
  
  const isInputDisabled = computed(() => store.practiceQueue.length === 0)
  
  const inputPlaceholder = computed(() => {
    if (store.practiceQueue.length === 0) {
      return store.vocabulary.length === 0 ? '请先添加词汇' : '太棒了！'
    }
    return '请在此输入拼音...'
  })

  function showNotification(message) {
    notificationMessage.value = message
    clearTimeout(notificationTimeout)
    notificationTimeout = setTimeout(() => {
      notificationMessage.value = ''
    }, 3000)
  }

  function checkInput() {
    const input = userInput.value.toLowerCase().trim().replace(/\s/g, '')
    if (!input || !currentWord.value) return

    const correctPinyin = currentWord.value.pinyin
    let isCorrect = false

    if (selectedScheme.value === 'quanpin') {
      isCorrect = (input === correctPinyin)
    } else {
      const correctShuangpin = toShuangpin(correctPinyin, selectedScheme.value)
      isCorrect = (input === correctShuangpin)
    }

    if (isCorrect) {
      showError.value = false
      const timeTaken = performance.now() - wordStartTime.value
      
      const result = store.submitCorrectAnswer(currentWord.value.id, timeTaken)
      
      if (result.isMastered) {
        showNotification(`已掌握 "${currentWord.value.hanzi}"！`)
      }
      
      // 准备下一个词
      userInput.value = ''
      startNewWord()
    } else {
      showError.value = true
      store.submitWrongAnswer(currentWord.value.id)
      setTimeout(() => {
        showError.value = false
      }, 400)
    }
  }

  function handleInput() {
    if (showError.value) {
      showError.value = false
    }
  }

  function startNewWord() {
    wordStartTime.value = performance.now()
  }

  // 监听当前词变化，开始计时
  watch(currentWord, (newWord) => {
    if (newWord) {
      startNewWord()
    }
  }, { immediate: true })

  return {
    currentWord,
    userInput,
    showError,
    notificationMessage,
    isInputDisabled,
    inputPlaceholder,
    checkInput,
    handleInput
  }
}