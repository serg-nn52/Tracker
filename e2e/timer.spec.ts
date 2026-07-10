import { test, expect } from '@playwright/test'

test.describe('Timer', () => {
  test('отображает начальное состояние таймера', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Таймер')
    await expect(page.getByText('00:00:00')).toBeVisible()
    await expect(page.getByRole('button', { name: '▶ Старт' })).toBeVisible()
  })

  test('запускает таймер и показывает кнопку паузы', async ({ page }) => {
    await page.goto('/')
    await page.getByText('▶ Старт').click()
    await expect(page.getByText('⏸ Пауза')).toBeVisible()
    await expect(page.getByText('● Запись…')).toBeVisible()
  })

  test('создаёт сессию после остановки', async ({ page }) => {
    await page.goto('/')

    // Запускаем таймер
    await page.getByText('▶ Старт').click()
    await page.waitForTimeout(1500)

    // Останавливаем
    await page.getByText('⏹ Стоп').click()

    // Переходим на вкладку "Сегодня"
    await page.getByText('Сегодня').click()
    await expect(page.getByText('00:00:0').first()).toBeVisible()
  })
})
