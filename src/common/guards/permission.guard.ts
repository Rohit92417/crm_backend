import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

type PermEntry = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request?.user as { id: number } | undefined;
    if (!user?.id) return false;

    // ── Query 1: resolve the user's role IDs ─────────────────────────────────
    const userRoles = await this.prisma.userRole.findMany({
      where: { refUserId: user.id },
      select: { refRoleId: true },
    });
    if (!userRoles.length) return false;

    const roleIds = userRoles.map((r) => r.refRoleId);

    // ── Query 2: fetch ALL permissions for those roles in one JOIN ────────────
    // Previously: 1 + N*2 queries (N = number of required permissions)
    // Now: always 2 queries regardless of how many permissions are required.
    const rawPerms = await this.prisma.modulePermission.findMany({
      where: { refRoleId: { in: roleIds } },
      select: {
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        module: { select: { moduleKey: true } },
      },
    });

    // Merge across roles: any role that grants an action is sufficient (OR logic)
    const permMap = new Map<string, PermEntry>();
    for (const p of rawPerms) {
      const key = p.module.moduleKey;
      const prev = permMap.get(key);
      permMap.set(key, {
        canView:   (prev?.canView   ?? false) || p.canView,
        canCreate: (prev?.canCreate ?? false) || p.canCreate,
        canUpdate: (prev?.canUpdate ?? false) || p.canUpdate,
        canDelete: (prev?.canDelete ?? false) || p.canDelete,
      });
    }

    // ── Evaluate required permissions in-memory (zero additional DB hits) ─────
    for (const permission of requiredPermissions) {
      const [moduleKey, action] = permission.split(':') as [string, string];
      const perm = permMap.get(moduleKey);
      if (!perm) return false;

      const allowed =
        action === 'view'   ? perm.canView   :
        action === 'create' ? perm.canCreate :
        action === 'update' ? perm.canUpdate :
        action === 'delete' ? perm.canDelete : false;

      if (!allowed) return false;
    }

    return true;
  }
}
