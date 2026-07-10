import { test, expect } from '@playwright/test'

test.describe('Theme', () => {
  test('переключает тему по клику на кнопку', async ({ page }) => {
    await page.goto('/')

    // По умолчанию — светлая тема
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    // Клик по тогглу темы
    await page.locator('button[aria-label="Переключить тему"]').click()

    // Стало тёмной
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // Ещё клик — обратно светлая
    await page.locator('button[aria-label="Переключить тему"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})
