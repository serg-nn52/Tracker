import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThemeToggle from '../ThemeToggle.vue'
import { useThemeStore } from '../../stores/themeStore'

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

describe('ThemeToggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Сброс темы на light для каждого теста
    const store = useThemeStore()
    store.setTheme('light')
  })

  it('отображает ☀️ для светлой темы', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.text()).toContain('☀️')
  })

  it('переключает тему по клику', async () => {
    const wrapper = mount(ThemeToggle)
    await wrapper.find('button').trigger('click')

    const store = useThemeStore()
    expect(store.theme).toBe('dark')
  })

  it('отображает 🌙 после переключения на тёмную тему', async () => {
    const wrapper = mount(ThemeToggle)
    const store = useThemeStore()

    await wrapper.find('button').trigger('click')
    expect(store.theme).toBe('dark')
    expect(wrapper.text()).toContain('🌙')
  })
})
