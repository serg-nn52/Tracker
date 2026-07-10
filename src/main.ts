import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import './styles/variables.scss'
import './styles/reset.scss'
import './styles/typography.scss'
import './styles/base.scss'
import './styles/utilities.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Инициализируем auth до монтирования, чтобы защищённые маршруты сразу знали статус
const auth = useAuthStore()
auth.init().finally(() => {
  app.mount('#app')
})
