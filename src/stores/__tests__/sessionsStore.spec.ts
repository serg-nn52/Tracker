import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSessionsStore } from '../sessionsStore'
import type { SessionRow } from '../../services/sessionsService'

// Мокаем sessionsService — vi.hoisted нужен т.к. vi.mock фабрика hoist-ится
const { mockFetchAll, mockCreate, mockRemove } = vi.hoisted(() => ({
  mockFetchAll: vi.fn(),
  mockCreate: vi.fn(),
  mockRemove: vi.fn(),
}))

vi.mock('../../services/sessionsService', () => ({
  sessionsService: {
    fetchAll: mockFetchAll,
    create: mockCreate,
    remove: mockRemove,
  },
}))

// Вспомогательные функции для создания тестовых данных
function makeRow(overrides: Partial<SessionRow> = {}): SessionRow {
  return {
    id: 'session-1',
    user_id: 'user-1',
    start_time: '2026-07-10T09:00:00.000Z',
    end_time: '2026-07-10T10:00:00.000Z',
    duration: 3600000, // 1 час
    date: '2026-07-10',
    created_at: '2026-07-10T10:00:00.000Z',
    ...overrides,
  }
}

describe('sessionsStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-10T12:00:00')) // Пятница, 10 июля 2026
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('начальное состояние', () => {
    it('sessions пуст', () => {
      const store = useSessionsStore()
      expect(store.sessions).toEqual([])
    })

    it('loading = false', () => {
      const store = useSessionsStore()
      expect(store.loading).toBe(false)
    })

    it('error = null', () => {
      const store = useSessionsStore()
      expect(store.error).toBeNull()
    })
  })

  describe('fetchSessions', () => {
    it('загружает сессии и маппит их', async () => {
      mockFetchAll.mockResolvedValue([
        makeRow({ id: 's1', duration: 1000, date: '2026-07-10' }),
        makeRow({ id: 's2', duration: 2000, date: '2026-07-10' }),
      ])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.sessions).toHaveLength(2)
      expect(store.sessions[0].id).toBe('s1')
      expect(store.sessions[0].duration).toBe(1000)
      expect(store.sessions[1].id).toBe('s2')
    })

    it('устанавливает loading в процессе', async () => {
      let resolvePromise!: (val: SessionRow[]) => void
      mockFetchAll.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))

      const store = useSessionsStore()
      const promise = store.fetchSessions()

      expect(store.loading).toBe(true)

      resolvePromise([])
      await promise

      expect(store.loading).toBe(false)
    })

    it('обрабатывает ошибку', async () => {
      mockFetchAll.mockRejectedValue(new Error('Network error'))

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })
  })

  describe('addSession', () => {
    it('добавляет сессию через сервис и в локальный массив', async () => {
      mockCreate.mockResolvedValue(makeRow({ id: 'new-id', duration: 5000 }))

      const store = useSessionsStore()
      await store.addSession({
        id: 'temp-id',
        startTime: 1720609200000,
        endTime: 1720609205000,
        duration: 5000,
        date: '2026-07-10',
      })

      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(store.sessions).toHaveLength(1)
      expect(store.sessions[0].id).toBe('new-id')
    })

    it('бросает ошибку для незавершённой сессии', async () => {
      const store = useSessionsStore()
      await expect(
        store.addSession({
          id: 'bad',
          startTime: 1000,
          endTime: null,
          duration: 0,
          date: '2026-07-10',
        })
      ).rejects.toThrow('Нельзя сохранить незавершённую сессию')
    })
  })

  describe('deleteSession', () => {
    it('удаляет сессию через сервис и из локального массива', async () => {
      mockFetchAll.mockResolvedValue([makeRow({ id: 'to-delete' })])
      mockRemove.mockResolvedValue(undefined)

      const store = useSessionsStore()
      await store.fetchSessions()
      expect(store.sessions).toHaveLength(1)

      await store.deleteSession('to-delete')
      expect(mockRemove).toHaveBeenCalledWith('to-delete')
      expect(store.sessions).toHaveLength(0)
    })
  })

  describe('todaySessions', () => {
    it('фильтрует сессии за сегодня', async () => {
      mockFetchAll.mockResolvedValue([
        makeRow({ id: 's1', date: '2026-07-10' }), // сегодня
        makeRow({ id: 's2', date: '2026-07-09' }), // вчера
        makeRow({ id: 's3', date: '2026-07-10' }), // сегодня
      ])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.todaySessions).toHaveLength(2)
      expect(store.todaySessions.map((s) => s.id).sort()).toEqual(['s1', 's3'])
    })
  })

  describe('todayTotal', () => {
    it('суммирует длительность сегодняшних сессий', async () => {
      mockFetchAll.mockResolvedValue([
        makeRow({ duration: 3600000, date: '2026-07-10' }), // 1 час
        makeRow({ duration: 1800000, date: '2026-07-10' }), // 30 мин
        makeRow({ duration: 7200000, date: '2026-07-09' }), // вчера — не входит
      ])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.todayTotal).toBe(5400000) // 1.5 часа
    })

    it('возвращает 0 если сегодня нет сессий', async () => {
      mockFetchAll.mockResolvedValue([
        makeRow({ duration: 1000, date: '2026-07-09' }),
      ])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.todayTotal).toBe(0)
    })
  })

  describe('weeklySessions', () => {
    it('фильтрует сессии за текущую неделю (пн-вс)', async () => {
      // 10 июля 2026 — пятница. Неделя: 6 июл (пн) — 12 июл (вс)
      mockFetchAll.mockResolvedValue([
        makeRow({ id: 'mon', date: '2026-07-06' }), // пн — входит
        makeRow({ id: 'fri', date: '2026-07-10' }), // пт — входит
        makeRow({ id: 'sun', date: '2026-07-12' }), // вс — входит
        makeRow({ id: 'prev-sun', date: '2026-07-05' }), // прошлое вс — не входит
        makeRow({ id: 'next-mon', date: '2026-07-13' }), // след пн — не входит
      ])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.weeklySessions).toHaveLength(3)
      const ids = store.weeklySessions.map((s) => s.id).sort()
      expect(ids).toEqual(['fri', 'mon', 'sun'])
    })
  })

  describe('weeklySummary', () => {
    it('возвращает 7 дней с суммами', async () => {
      mockFetchAll.mockResolvedValue([
        makeRow({ duration: 3600000, date: '2026-07-06' }), // пн — 1ч
        makeRow({ duration: 1800000, date: '2026-07-10' }), // пт — 30м
        makeRow({ duration: 7200000, date: '2026-07-08' }), // ср — 2ч
      ])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.weeklySummary).toHaveLength(7)

      // Проверяем конкретные дни
      const mon = store.weeklySummary.find((d) => d.date === '2026-07-06')
      expect(mon?.total).toBe(3600000)

      const wed = store.weeklySummary.find((d) => d.date === '2026-07-08')
      expect(wed?.total).toBe(7200000)

      const fri = store.weeklySummary.find((d) => d.date === '2026-07-10')
      expect(fri?.total).toBe(1800000)

      // Пустые дни
      const tue = store.weeklySummary.find((d) => d.date === '2026-07-07')
      expect(tue?.total).toBe(0)
    })

    it('дни идут с понедельника по воскресенье', async () => {
      mockFetchAll.mockResolvedValue([])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.weeklySummary[0].date).toBe('2026-07-06') // пн
      expect(store.weeklySummary[6].date).toBe('2026-07-12') // вс
    })
  })

  describe('weeklyTotal', () => {
    it('суммирует все сессии за неделю', async () => {
      mockFetchAll.mockResolvedValue([
        makeRow({ duration: 3600000, date: '2026-07-06' }),
        makeRow({ duration: 1800000, date: '2026-07-10' }),
        makeRow({ duration: 7200000, date: '2026-07-08' }),
      ])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.weeklyTotal).toBe(12600000) // 1 + 0.5 + 2 = 3.5 часа
    })

    it('возвращает 0 если за неделю нет сессий', async () => {
      mockFetchAll.mockResolvedValue([])

      const store = useSessionsStore()
      await store.fetchSessions()

      expect(store.weeklyTotal).toBe(0)
    })
  })
})
