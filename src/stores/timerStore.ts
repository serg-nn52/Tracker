import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import { useSessionsStore } from './sessionsStore'
import { generateId, todayDate } from '../utils/formatters'

export const useTimerStore = defineStore('timer', () => {
  const startTimestamp = ref<number | null>(null)
  const elapsedBeforeStart = ref(0) // ms, накоплено до паузы
  const isRunning = ref(false)

  let intervalId: ReturnType<typeof setInterval> | null = null

  const currentElapsed = ref(0)

  function startInterval() {
    stopInterval()
    intervalId = setInterval(() => {
      if (startTimestamp.value === null) return
      const elapsed = Date.now() - startTimestamp.value + elapsedBeforeStart.value
      currentElapsed.value = elapsed
    }, 200) // 200ms для плавности
  }

  function stopInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function start() {
    if (isRunning.value) return
    startTimestamp.value = Date.now()
    isRunning.value = true
    startInterval()
  }

  function pause() {
    if (!isRunning.value) return
    // Фиксируем накопленное время
    elapsedBeforeStart.value = currentElapsed.value
    startTimestamp.value = null
    isRunning.value = false
    stopInterval()
  }

  function stop() {
    if (currentElapsed.value === 0) return

    const sessionsStore = useSessionsStore()

    // Если не на паузе — сначала фиксируем
    if (isRunning.value) {
      elapsedBeforeStart.value = currentElapsed.value
      startTimestamp.value = null
      isRunning.value = false
      stopInterval()
    }

    const duration = elapsedBeforeStart.value

    if (duration > 0) {
      const now = Date.now()
      sessionsStore.addSession({
        id: generateId(),
        startTime: now - duration,
        endTime: now,
        duration,
        date: todayDate(),
      })
    }

    // Сброс
    reset()
  }

  function reset() {
    stopInterval()
    isRunning.value = false
    startTimestamp.value = null
    elapsedBeforeStart.value = 0
    currentElapsed.value = 0
  }

  // Очистка при уничтожении стора
  onUnmounted(() => {
    stopInterval()
  })

  return {
    isRunning,
    currentElapsed,
    start,
    pause,
    stop,
    reset,
  }
})
