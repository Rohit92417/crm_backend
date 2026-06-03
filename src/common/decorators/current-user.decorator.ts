import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: number;
  email: string;
  name: string;
  userType: 'CRM_ADMIN' | 'CRM_USER' | 'CLIENT_ADMIN' | 'CLIENT_USER';
  refCompanyId: number | null;
  isActive: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
