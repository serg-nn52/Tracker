import api from './api'

export interface SessionRow {
  id: string
  user_id: string
  start_time: string
  end_time: string
  duration: number
  date: string
  created_at: string
}

export interface CreateSessionDto {
  startTime: string
  endTime: string
  duration: number
  date: string
}

export const sessionsService = {
  /** Получить все сессии */
  async fetchAll(): Promise<SessionRow[]> {
    const { data } = await api.get<SessionRow[]>('/sessions')
    return data
  },

  /** Создать сессию */
  async create(dto: CreateSessionDto): Promise<SessionRow> {
    const { data } = await api.post<SessionRow>('/sessions', dto)
    return data
  },

  /** Удалить сессию по ID */
  async remove(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`)
  },
}
