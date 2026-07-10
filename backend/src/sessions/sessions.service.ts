import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(userId: string, jwt: string | undefined, dto: CreateSessionDto) {
    const { data, error } = await this.supabase
      .getClientWithJwt(jwt)
      .from('sessions')
      .insert({
        user_id: userId,
        start_time: dto.startTime,
        end_time: dto.endTime,
        duration: dto.duration,
        date: dto.date,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(userId: string, jwt: string | undefined) {
    const { data, error } = await this.supabase
      .getClientWithJwt(jwt)
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findByDate(userId: string, jwt: string | undefined, date: string) {
    const { data, error } = await this.supabase
      .getClientWithJwt(jwt)
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('start_time', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  /** Суммарное время за сегодня */
  async todaySummary(userId: string, jwt: string | undefined) {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await this.findByDate(userId, jwt, today);

    const total = sessions.reduce((sum, s) => sum + s.duration, 0);
    return { date: today, sessions, total };
  }

  /** Сводка за последние 7 дней */
  async weeklySummary(userId: string, jwt: string | undefined) {
    const sessions = await this.findAll(userId, jwt);

    // Группируем по дате
    const dayLabels: Record<string, string> = {
      '0': 'Вс',
      '1': 'Пн',
      '2': 'Вт',
      '3': 'Ср',
      '4': 'Чт',
      '5': 'Пт',
      '6': 'Сб',
    };

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Берём только за последнюю неделю
    const recent = sessions.filter((s) => s.date >= weekAgoStr);

    const grouped = new Map<string, number>();
    for (const s of recent) {
      grouped.set(s.date, (grouped.get(s.date) || 0) + s.duration);
    }

    // Формируем 7 дней с понедельника
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        date: iso,
        dayLabel: dayLabels[d.getDay().toString()],
        total: grouped.get(iso) || 0,
      });
    }

    const weeklyTotal = days.reduce((sum, d) => sum + d.total, 0);

    return { days, weeklyTotal };
  }

  async remove(userId: string, jwt: string | undefined, id: string) {
    // Проверяем, что сессия принадлежит пользователю
    const { data: session, error: findError } = await this.supabase
      .getClientWithJwt(jwt)
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !session) {
      throw new NotFoundException('Сессия не найдена');
    }

    if (session.user_id !== userId) {
      throw new NotFoundException('Сессия не найдена');
    }

    const { error } = await this.supabase
      .getClientWithJwt(jwt)
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { deleted: true };
  }
}
