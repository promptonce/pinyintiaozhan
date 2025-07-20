import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 初始化默认词库
import { useVocabularyStore } from './stores/vocabularyStore'
const store = useVocabularyStore()
store.initializeDefaultVocabulary()

app.mount('#app')