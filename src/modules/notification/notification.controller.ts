import {
  Controller,
  Get,
  Sse,
  MessageEvent,
  UseGuards,
  Request,
  Patch,
  Param,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Observable, map } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  // SSE connections are long-lived; exempt from per-minute throttle counts.
  @SkipThrottle()
  @Sse('stream')
  stream(@Request() req): Observable<MessageEvent> {
    const userId: number = req.user.id;
    return this.service
      .getNotificationStream(userId)
      .pipe(map((notification) => ({ data: notification } as MessageEvent)));
  }

  @Get()
  async findAll(@Request() req) {
    return this.service.findManyForUser(req.user.id as number);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.service.markAsRead(+id, req.user.id as number);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req) {
    return this.service.markAllAsRead(req.user.id as number);
  }
}
