import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthError, User, AuthResponse } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Runtime-флаг для отключения проверки авторизации.
   * Синхронно инициализируется из VITE_BYPASS_AUTH,
   * чтобы guard видел правильное значение до асинхронной init().
   */
  const devBypass = ref(import.meta.env.VITE_BYPASS_AUTH === 'true')

  /** Восстановить сессию из localStorage (вызывать при старте) */
  async function init() {
    loading.value = true
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

    // Если есть реальная сессия — отключаем bypass, даже если стоит env-флаг
    if (user.value) {
      devBypass.value = false
    }
    // Если сессии нет — devBypass остаётся как был (из VITE_BYPASS_AUTH)

    // Слушаем изменения auth (например, при OAuth)
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })

    loading.value = false
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err }: AuthResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (err) throw err
      user.value = data.user
    } catch (e) {
      const authErr = e as AuthError
      error.value = authErr.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err }: AuthResponse = await supabase.auth.signUp({
        email,
        password,
      })

      if (err) throw err
      user.value = data.user
      return data
    } catch (e) {
      const authErr = e as AuthError
      error.value = authErr.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      await supabase.auth.signOut()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const isAuthenticated = computed(() => user.value !== null || devBypass.value)

  function toggleDevBypass() {
    devBypass.value = !devBypass.value
  }

  return {
    user,
    loading,
    error,
    devBypass,
    init,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    toggleDevBypass,
  }
})
