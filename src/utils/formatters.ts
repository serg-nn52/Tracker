/**
 * Форматирует длительность в мс в ЧЧ:ММ:СС
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':')
}

/**
 * Форматирует timestamp в ЧЧ:ММ
 */
export function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Форматирует дату: "10 июля 2026"
 */
export function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Форматирует дату кратко: "10 июл"
 */
export function formatDateShort(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Возвращает сегодняшнюю дату в формате YYYY-MM-DD
 */
export function todayDate(): string {
  const d = new Date()
  return dateToISO(d)
}

/**
 * Преобразует Date в YYYY-MM-DD
 */
export function dateToISO(d: Date): string {
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Возвращает диапазон текущей недели (пн-вс)
 */
export function getWeekRange(now: Date = new Date()): { start: Date; end: Date } {
  const dayOfWeek = now.getDay() // 0 = вс, 1 = пн ...
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // сколько дней от понедельника
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Форматирует диапазон недели: "4 — 10 июля 2026"
 */
export function formatWeekRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
  const endStr = end.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${startStr} — ${endStr}`
}

/**
 * Названия дней недели (сокращённые)
 */
export const DAY_NAMES_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

/**
 * Генерирует UUID v4 для id сессии
 */
export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
