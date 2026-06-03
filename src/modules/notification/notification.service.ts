import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Observable, map } from 'rxjs';
import {
  NotificationCategory,
  NotificationPriority,
} from '../../../generated/prisma/enums';
import {
  NotificationBroadcaster,
  BroadcastNotification,
} from './notification-broadcaster';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly broadcaster: NotificationBroadcaster,
  ) {}

  async create(data: {
    category: NotificationCategory;
    title: string;
    message: string;
    recipientUserIds: number[];
    refSenderUserId?: number;
    referenceType?: string;
    referenceId?: number;
    actionUrl?: string;
    priority?: NotificationPriority;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        category: data.category,
        title: data.title,
        message: data.message,
        refSenderUserId: data.refSenderUserId,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        actionUrl: data.actionUrl,
        priority: data.priority ?? 'NORMAL',
        recipients: {
          createMany: {
            data: data.recipientUserIds.map((userId) => ({ refUserId: userId })),
          },
        },
      },
      include: { recipients: true },
    });

    // Publish via the injectable broadcaster — swap the provider to scale
    const event: BroadcastNotification = {
      ...notification,
      recipientIds: data.recipientUserIds,
    };
    this.broadcaster.publish(event);

    return notification;
  }

  async findManyForUser(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipients: { some: { refUserId: userId } } },
      include: { recipients: { where: { refUserId: userId } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => ({
      id: n.id,
      category: n.category,
      title: n.title,
      message: n.message,
      priority: n.priority,
      referenceType: n.referenceType,
      referenceId: n.referenceId,
      actionUrl: n.actionUrl,
      isRead: n.recipients[0]?.isRead ?? false,
      readAt: n.recipients[0]?.readAt ?? null,
      createdAt: n.createdAt,
    }));
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notificationRecipient.updateMany({
      where: { refNotificationId: notificationId, refUserId: userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notificationRecipient.updateMany({
      where: { refUserId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  getNotificationStream(userId: number): Observable<BroadcastNotification> {
    return this.broadcaster.stream(userId);
  }
}
