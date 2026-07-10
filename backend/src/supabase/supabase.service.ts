import { Injectable, OnModuleInit } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../../.env') })

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient
  private adminClient: SupabaseClient

  onModuleInit() {
    const url = process.env.SUPABASE_URL
    const anonKey = process.env.SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env')
    }

    // Для проверки JWT — используем anon key
    this.client = createClient(url, anonKey, {
      auth: { persistSession: false },
    })

    // Для операций от имени сервера (админ) — service_role key
    if (serviceRoleKey) {
      this.adminClient = createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
      })
    }
  }

  /** Публичный клиент (анонимный, для проверки токенов) */
  getClient(): SupabaseClient {
    return this.client
  }

  /** Админ-клиент (service_role, обходит RLS) */
  getAdminClient(): SupabaseClient {
    return this.adminClient
  }
}
