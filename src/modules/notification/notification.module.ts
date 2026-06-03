import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationBroadcaster, LocalNotificationBroadcaster } from './notification-broadcaster';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    NotificationService,
    // To scale to multi-instance: replace useClass with a Redis-backed broadcaster.
    // See NotificationBroadcaster (notification-broadcaster.ts) for the swap guide.
    { provide: NotificationBroadcaster, useClass: LocalNotificationBroadcaster },
  ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
