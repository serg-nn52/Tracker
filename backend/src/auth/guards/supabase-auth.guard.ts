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
    const token = this.extractToken(request);

    if (token) {
      // Есть JWT — проверяем и используем реального пользователя
      const { data, error } = await this.supabase.getClient().auth.getUser(token);

      if (!error && data?.user) {
        request['user'] = data.user;
        request['accessToken'] = token;
        return true;
      }
    }

    // Нет JWT или он недействителен — в DEV_MODE используем dev-пользователя
    if (process.env.DEV_MODE === 'true') {
      const userId = await this.supabase.getDevUserId();
      request['user'] = { id: userId };
      return true;
    }

    throw new UnauthorizedException('Токен не предоставлен');
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization;
    if (!auth) return null;

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') return null;

    return token;
  }
}
