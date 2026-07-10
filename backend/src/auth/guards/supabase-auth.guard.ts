import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Режим разработки — пропускаем JWT, используем dev-пользователя
    if (process.env.DEV_MODE === 'true') {
      const userId = await this.supabase.getDevUserId();
      request['user'] = { id: userId };
      return true;
    }

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    const { data, error } = await this.supabase.getClient().auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException('Недействительный токен');
    }

    // Сохраняем пользователя в request для дальнейшего использования
    request['user'] = data.user;
    return true;
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization;
    if (!auth) return null;

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') return null;

    return token;
  }
}
