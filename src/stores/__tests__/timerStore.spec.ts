import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTimerStore } from '../timerStore'

// Полностью мокаем модуль sessionsStore — в timerStore.stop() используется
// только useSessionsStore().addSession()
vi.mock('../sessionsStore', () => ({
  useSessionsStore: vi.fn(),
}))

describe('timerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    // Подавляем Vue warning об onUnmounted вне компонента
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('изначально не запущен, elapsed = 0', () => {
    const store = useTimerStore()
    expect(store.isRunning).toBe(false)
    expect(store.currentElapsed).toBe(0)
  })

  it('start() запускает таймер', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00'))
    const store = useTimerStore()
    store.start()
    expect(store.isRunning).toBe(true)
  })

  it('elapsed увеличивается после старта', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00'))
    const store = useTimerStore()
    store.start()
    vi.advanceTimersByTime(2000)
    expect(store.currentElapsed).toBe(2000)
  })

  it('pause() приостанавливает и elapsed не растёт', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00'))
    const store = useTimerStore()
    store.start()
    vi.advanceTimersByTime(3000)
    vi.setSystemTime(new Date('2026-07-10T10:00:03'))
    store.pause()

    expect(store.isRunning).toBe(false)
    const frozen = store.currentElapsed
    expect(frozen).toBeGreaterThanOrEqual(3000)

    // Время не должно расти на паузе
    vi.advanceTimersByTime(5000)
    expect(store.currentElapsed).toBe(frozen)
  })

  it('stop() сохраняет сессию и сбрасывает таймер', async () => {
    const mockAddSession = vi.fn().mockResolvedValue(undefined)

    // Настраиваем мок до вызова useTimerStore
    const { useSessionsStore } = await import('../sessionsStore')
    vi.mocked(useSessionsStore).mockReturnValue({
      addSession: mockAddSession,
    } as unknown as ReturnType<typeof useSessionsStore>)

    vi.setSystemTime(new Date('2026-07-10T10:00:00'))
    const store = useTimerStore()

    store.start()
    vi.advanceTimersByTime(5000)
    vi.setSystemTime(new Date('2026-07-10T10:00:05'))
    await store.stop()

    expect(mockAddSession).toHaveBeenCalledTimes(1)
    expect(store.isRunning).toBe(false)
    expect(store.currentElapsed).toBe(0)
  })

  it('stop() не сохраняет сессию если elapsed = 0', async () => {
    const mockAddSession = vi.fn().mockResolvedValue(undefined)

    const { useSessionsStore } = await import('../sessionsStore')
    vi.mocked(useSessionsStore).mockReturnValue({
      addSession: mockAddSession,
    } as unknown as ReturnType<typeof useSessionsStore>)

    const store = useTimerStore()
    await store.stop()
    expect(mockAddSession).not.toHaveBeenCalled()
  })

  it('reset() сбрасывает все значения', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00'))
    const store = useTimerStore()
    store.start()
    vi.advanceTimersByTime(2000)
    store.reset()

    expect(store.isRunning).toBe(false)
    expect(store.currentElapsed).toBe(0)
  })

  it('повторный start() не сбрасывает накопленное время', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00'))
    const store = useTimerStore()
    store.start()
    vi.advanceTimersByTime(3000)
    store.start() // повторный вызов
    expect(store.currentElapsed).toBeGreaterThanOrEqual(3000)
  })

  it('pause() + start() сохраняет накопленное время', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00'))
    const store = useTimerStore()
    store.start()
    vi.advanceTimersByTime(2000)
    store.pause()

    // Проходит время
    vi.advanceTimersByTime(10000)

    // Снова запускаем
    store.start()
    vi.advanceTimersByTime(1000)
    vi.setSystemTime(new Date('2026-07-10T10:00:13'))

    // Должно быть 2000 (до паузы) + 1000 (после) = ~3000
    expect(store.currentElapsed).toBeGreaterThanOrEqual(2950)
    expect(store.currentElapsed).toBeLessThan(3100)
  })
})
