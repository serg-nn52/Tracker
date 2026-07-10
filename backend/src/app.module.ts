import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [SupabaseModule, AuthModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
