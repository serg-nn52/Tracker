import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TimeSession } from '../types/session'
import { getFromStorage, saveToStorage } from '../utils/storage'
import { todayDate, getWeekRange, dateToISO } from '../utils/formatters'

const STORAGE_KEY = 'sessions'

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<TimeSession[]>([])

  // Загружаем из localStorage
  function loadFromStorage() {
    sessions.value = getFromStorage<TimeSession[]>(STORAGE_KEY, [])
  }

  // Сохраняем
  function persist() {
    saveToStorage(STORAGE_KEY, sessions.value)
  }

  // Инициализация
  loadFromStorage()

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

  function addSession(session: TimeSession) {
    sessions.value.push(session)
    persist()
  }

  function deleteSession(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id)
    persist()
  }

  return {
    sessions,
    todaySessions,
    todayTotal,
    weeklySessions,
    weeklySummary,
    weeklyTotal,
    loadFromStorage,
    addSession,
    deleteSession,
  }
})
