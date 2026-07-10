import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;
  private devUserId: string | null = null;

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
    }

    const realtimeOptions = {
      transport: WebSocket as any,
    };

    // Для проверки JWT — используем anon key
    this.client = createClient(url, anonKey, {
      auth: { persistSession: false },
      realtime: realtimeOptions,
    });

    // Для операций от имени сервера (админ) — service_role key
    if (serviceRoleKey) {
      this.adminClient = createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
        realtime: realtimeOptions,
      });
    }
  }

  /** Публичный клиент (анонимный, для проверки токенов) */
  getClient(): SupabaseClient {
    return this.client;
  }

  /** Админ-клиент (service_role, обходит RLS) */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  /**
   * Клиент с JWT конкретного пользователя.
   * Использует anon key + Bearer JWT → RLS работает через auth.uid().
   * Если jwt не передан — возвращает adminClient (для DEV_MODE).
   */
  getClientWithJwt(jwt?: string): SupabaseClient {
    if (!jwt) return this.getAdminClient();

    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
    }

    return createClient(url, anonKey, {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
      },
      realtime: {
        transport: WebSocket as any,
      },
    });
  }

  /** Создать или найти dev-пользователя для режима разработки */
  async getDevUserId(): Promise<string> {
    if (this.devUserId) return this.devUserId;

    // Если нет service_role — используем фиксированный ID
    if (!this.adminClient) {
      console.warn(
        'DEV_MODE: нет service_role, использую фиксированный user_id',
      );
      this.devUserId = '00000000-0000-0000-0000-000000000001';
      return this.devUserId;
    }

    try {
      // Пробуем найти существующего dev-пользователя
      const { data: users } = await this.adminClient.auth.admin.listUsers();
      const existing = users?.users.find(
        (u) => u.email === 'dev@tracker.local',
      );
      if (existing) {
        this.devUserId = existing.id;
        return this.devUserId;
      }

      // Создаём нового dev-пользователя
      const { data, error } = await this.adminClient.auth.admin.createUser({
        email: 'dev@tracker.local',
        password: 'dev123456',
        email_confirm: true,
      });

      if (error) throw error;
      if (!data?.user) throw new Error('Failed to create dev user');

      this.devUserId = data.user.id;
      return this.devUserId;
    } catch (e) {
      console.error(
        'DEV_MODE: не удалось создать пользователя, используем UUID:',
        e,
      );
      this.devUserId = '00000000-0000-0000-0000-000000000001';
      return this.devUserId;
    }
  }
}
