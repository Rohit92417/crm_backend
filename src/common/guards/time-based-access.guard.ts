import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CurrentUserData } from '../decorators/current-user.decorator';

@Injectable()
export class TimeBasedAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;

    // Only apply to client users
    if (user.userType === 'CRM_ADMIN' || user.userType === 'CRM_USER') {
      return true;
    }

 
    return true;
  }
}
