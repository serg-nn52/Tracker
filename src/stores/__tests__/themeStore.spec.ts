import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../themeStore'

// Mock window.matchMedia для jsdom
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.dataset.theme = ''
  })

  it('начинает со светлой темы при отсутствии сохранённой', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('light')
  })

  it('начинает с тёмной темы, если сохранена тёмная', () => {
    localStorage.setItem('tracker-theme', JSON.stringify('dark'))
    const store = useThemeStore()
    expect(store.theme).toBe('dark')
  })

  it('setTheme меняет тему и сохраняет в localStorage', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(localStorage.getItem('tracker-theme')).toBe(JSON.stringify('dark'))
  })

  it('setTheme устанавливает data-theme на <html>', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('toggleTheme переключает со светлой на тёмную', () => {
    const store = useThemeStore()
    store.toggleTheme()
    expect(store.theme).toBe('dark')
  })

  it('toggleTheme переключает с тёмной на светлую', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('при создании применяет сохранённую тему к <html>', () => {
    localStorage.setItem('tracker-theme', JSON.stringify('dark'))
    useThemeStore()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
