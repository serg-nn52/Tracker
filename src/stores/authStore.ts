import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuthError, User, AuthResponse } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Восстановить сессию из localStorage (вызывать при старте) */
  async function init() {
    loading.value = true
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

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

  const isAuthenticated = () => user.value !== null

  return {
    user,
    loading,
    error,
    init,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  }
})
