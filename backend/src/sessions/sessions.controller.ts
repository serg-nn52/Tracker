import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('sessions')
@UseGuards(SupabaseAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(req.user.id, req.accessToken, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.sessionsService.findAll(req.user.id, req.accessToken);
  }

  @Get('today')
  getToday(@Request() req: any) {
    return this.sessionsService.todaySummary(req.user.id, req.accessToken);
  }

  @Get('weekly')
  getWeekly(@Request() req: any) {
    return this.sessionsService.weeklySummary(req.user.id, req.accessToken);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.sessionsService.remove(req.user.id, req.accessToken, id);
  }
}
