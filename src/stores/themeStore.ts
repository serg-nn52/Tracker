import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Theme } from '../types/session'
import { getFromStorage, saveToStorage } from '../utils/storage'

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'theme'

  // Определяем начальную тему
  function getInitialTheme(): Theme {
    const saved = getFromStorage<Theme | null>(STORAGE_KEY, null)
    if (saved === 'light' || saved === 'dark') return saved

    // Системные настройки
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const theme = ref<Theme>(getInitialTheme())

  // Применяем тему на <html>
  function applyTheme(t: Theme) {
    document.documentElement.dataset.theme = t
  }

  // Применить при инициализации
  applyTheme(theme.value)

  function setTheme(t: Theme) {
    theme.value = t
    applyTheme(t)
    saveToStorage(STORAGE_KEY, t)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  return { theme, setTheme, toggleTheme }
})
