import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TimeSession } from '../types/session'
import { todayDate, getWeekRange, dateToISO } from '../utils/formatters'
import { sessionsService, type SessionRow } from '../services/sessionsService'

function mapRowToSession(row: SessionRow): TimeSession {
  return {
    id: row.id,
    startTime: new Date(row.start_time).getTime(),
    endTime: new Date(row.end_time).getTime(),
    duration: row.duration,
    date: row.date,
  }
}

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<TimeSession[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Загрузить все сессии с бэкенда
  async function fetchSessions() {
    loading.value = true
    error.value = null
    try {
      const rows = await sessionsService.fetchAll()
      sessions.value = rows.map(mapRowToSession)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки сессий'
      // При ошибке не сбрасываем локальные данные
    } finally {
      loading.value = false
    }
  }

  // Сегодняшние сессии
  const todaySessions = computed(() => {
    const today = todayDate()
    return sessions.value.filter((s) => s.date === today)
  })

  // Сумма за сегодня
  const todayTotal = computed(() => {
    return todaySessions.value.reduce((sum, s) => sum + s.duration, 0)
  })

  // Сессии за текущую неделю
  const weeklySessions = computed(() => {
    const { start, end } = getWeekRange()
    return sessions.value.filter((s) => {
      const d = new Date(s.date).getTime()
      return d >= start.getTime() && d <= end.getTime()
    })
  })

  // Сумма по дням недели
  const weeklySummary = computed(() => {
    const { start } = getWeekRange()
    const days: { date: string; dayLabel: string; total: number; iso: string }[] = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const iso = dateToISO(d)
      const dayLabel = d.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
      })

      const daySessions = weeklySessions.value.filter((s) => s.date === iso)
      const total = daySessions.reduce((sum, s) => sum + s.duration, 0)

      days.push({ date: iso, dayLabel, total, iso })
    }

    return days
  })

  // Сумма за неделю
  const weeklyTotal = computed(() => {
    return weeklySummary.value.reduce((sum, d) => sum + d.total, 0)
  })

  async function addSession(session: TimeSession) {
    try {
      if (session.endTime === null) {
        throw new Error('Нельзя сохранить незавершённую сессию')
      }
      const row = await sessionsService.create({
        startTime: new Date(session.startTime).toISOString(),
        endTime: new Date(session.endTime).toISOString(),
        duration: session.duration,
        date: session.date,
      })
      // Добавляем созданную сервером сессию (с её id)
      const created = mapRowToSession(row)
      sessions.value.push(created)
      return created
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Ошибка создания сессии'
      throw e
    }
  }

  /** Сбросить сессии (при логауте) */
  function reset() {
    sessions.value = []
    error.value = null
  }

  async function deleteSession(id: string) {
    try {
      await sessionsService.remove(id)
      sessions.value = sessions.value.filter((s) => s.id !== id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Ошибка удаления сессии'
      throw e
    }
  }

  return {
    sessions,
    loading,
    error,
    todaySessions,
    todayTotal,
    weeklySessions,
    weeklySummary,
    weeklyTotal,
    fetchSessions,
    addSession,
    deleteSession,
    reset,
  }
})
