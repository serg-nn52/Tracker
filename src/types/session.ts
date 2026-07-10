export interface TimeSession {
  id: string
  startTime: number // timestamp ms
  endTime: number | null // null = ещё идёт
  duration: number // ms
  date: string // YYYY-MM-DD
}

export type Theme = 'light' | 'dark'

export type ViewName = 'timer' | 'today' | 'weekly'
