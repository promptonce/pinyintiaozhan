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
      // 播放正确发音
      playPronunciation(currentWord.value.hanzi)
      setTimeout(() => {
        showError.value = false
      }, 400)
    }
  }

  // 语音播放函数
  function playPronunciation(text) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    
    // 获取所有可用语音并筛选更自然的中文语音
    const voices = window.speechSynthesis.getVoices()
    // 扩展语音选择范围，适配不同系统的高质量中文语音
    const chineseVoice = voices.find(voice => 
      // Windows系统高质量语音
      voice.name.includes('Microsoft Yaoyao') || 
      voice.name.includes('Microsoft Huihui') ||
      voice.name.includes('Microsoft Xiaoxiao') ||
      // macOS系统高质量语音
      voice.name.includes('Ting-Ting') ||
      voice.name.includes('Mei-Jia') ||
      // 通用中文语音
      voice.name.includes('Google 普通话') ||
      voice.name.includes('Chinese (Simplified)') ||
      (voice.lang === 'zh-CN' && voice.voiceURI.includes('natural'))
    )
    
    if (chineseVoice) {
      utterance.voice = chineseVoice
    } else if (voices.length > 0) {
      // 如果没有找到理想语音，尝试使用第一个中文语音
      const fallbackVoice = voices.find(voice => voice.lang.includes('zh'))
      if (fallbackVoice) utterance.voice = fallbackVoice
    }
    
    // 进一步优化中文语音参数
    utterance.pitch = 1.0
    utterance.rate = 0.95
    utterance.volume = 1.0
    
    // 确保语音加载完成后再播放
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.speak(utterance)
        window.speechSynthesis.onvoiceschanged = null
      }
    } else {
      window.speechSynthesis.speak(utterance)
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