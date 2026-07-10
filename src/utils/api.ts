import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  async get<T = any>(path: string): Promise<T> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}${path}`, { headers })
    return handleResponse(res)
  },

  async post<T = any>(path: string, body: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    return handleResponse(res)
  },

  async delete<T = any>(path: string): Promise<T> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers,
    })
    return handleResponse(res)
  },
}
