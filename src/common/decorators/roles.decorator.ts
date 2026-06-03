import { SetMetadata } from '@nestjs/common';

export type UserType = 'CRM_ADMIN' | 'CRM_USER' | 'CLIENT_ADMIN' | 'CLIENT_USER';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
