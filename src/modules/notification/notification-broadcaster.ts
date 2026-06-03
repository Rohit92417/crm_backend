import { Observable, Subject, filter } from 'rxjs';

export interface BroadcastNotification {
  id: number;
  recipientIds: number[];
  [key: string]: unknown;
}

/**
 * Abstract contract for the notification delivery bus.
 *
 * Current implementation: LocalNotificationBroadcaster (in-process Subject)
 * — works for a single instance; notifications are lost if the emitting
 *   instance and the SSE-connected instance differ.
 *
 * To scale horizontally, swap LocalNotificationBroadcaster for a Redis-backed
 * implementation (ioredis pub/sub) without touching any other code.
 *
 * Swap guide:
 *   1. npm install ioredis @nestjs-modules/ioredis
 *   2. Create RedisNotificationBroadcaster implements NotificationBroadcaster
 *      - publish():   await this.redis.publish('notifications', JSON.stringify(event))
 *      - stream():    subscribe to the channel, push to a per-connection Subject
 *   3. Replace { useClass: LocalNotificationBroadcaster } in notification.module.ts
 */
export abstract class NotificationBroadcaster {
  abstract publish(notification: BroadcastNotification): void;
  abstract stream(userId: number): Observable<BroadcastNotification>;
}

/**
 * Single-instance implementation backed by an in-process RxJS Subject.
 * Register as provider in notification.module.ts:
 *   { provide: NotificationBroadcaster, useClass: LocalNotificationBroadcaster }
 */
export class LocalNotificationBroadcaster extends NotificationBroadcaster {
  private readonly subject = new Subject<BroadcastNotification>();

  publish(notification: BroadcastNotification): void {
    this.subject.next(notification);
  }

  stream(userId: number): Observable<BroadcastNotification> {
    return this.subject
      .asObservable()
      .pipe(filter((n) => n.recipientIds.includes(userId)));
  }
}
