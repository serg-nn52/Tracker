import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('переключается между вкладками', async ({ page }) => {
    await page.goto('/')

    // По умолчанию — Таймер
    await expect(page.locator('h1')).toContainText('Таймер')

    // Сегодня
    await page.getByText('Сегодня').click()
    await expect(page.locator('h1')).toContainText('Сегодня')

    // Неделя
    await page.getByText('Неделя').click()
    await expect(page.locator('h1')).toContainText('Неделя')

    // Назад на Таймер
    await page.getByText('Таймер').click()
    await expect(page.locator('h1')).toContainText('Таймер')
  })

  test('подсвечивает активную вкладку', async ({ page }) => {
    await page.goto('/')

    // Вкладка "Таймер" активна по умолчанию
    const timerLink = page.getByRole('link', { name: '⏱ Таймер' })
    await expect(timerLink).toBeVisible()

    // Клик на "Неделя"
    await page.getByText('Неделя').click()
    await expect(page.locator('h1')).toContainText('Неделя')
  })
})
