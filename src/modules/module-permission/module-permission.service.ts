import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateModulePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class ModulePermissionService {
  private readonly logger = new Logger(ModulePermissionService.name);

  constructor(private prisma: PrismaService) {}

  async getMyPermissions(userId: number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { refUserId: userId },
      select: { refRoleId: true },
    });

    if (!userRoles.length) return [];

    const roleIds = userRoles.map((r) => r.refRoleId);

    const perms = await this.prisma.modulePermission.findMany({
      where: { refRoleId: { in: roleIds } },
      include: { module: { select: { moduleKey: true } } },
      orderBy: { refModuleId: 'asc' },
    });

    return perms.map((p) => ({
      id: p.id,
      refRoleId: p.refRoleId,
      refModuleId: p.refModuleId,
      moduleKey: p.module.moduleKey,
      canView: p.canView,
      canCreate: p.canCreate,
      canUpdate: p.canUpdate,
      canDelete: p.canDelete,
      canApprove: p.canApprove,
      canAssign: p.canAssign,
      canExport: p.canExport,
    }));
  }

  async findAllByRole(roleId: number) {
    const perms = await this.prisma.modulePermission.findMany({
      where: { refRoleId: roleId },
      include: { module: { select: { moduleKey: true } } },
      orderBy: { refModuleId: 'asc' },
    });

    return perms.map((p) => ({
      id: p.id,
      refRoleId: p.refRoleId,
      refModuleId: p.refModuleId,
      moduleKey: p.module.moduleKey,
      canView: p.canView,
      canCreate: p.canCreate,
      canUpdate: p.canUpdate,
      canDelete: p.canDelete,
      canApprove: p.canApprove,
      canAssign: p.canAssign,
      canExport: p.canExport,
    }));
  }

  async getAllModuleKeys(): Promise<string[]> {
    const modules = await this.prisma.module.findMany({
      select: { moduleKey: true },
    });
    return modules.map(m => m.moduleKey);
  }

  async bulkUpdate(roleId: number, permissions: UpdateModulePermissionDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const p of permissions) {
        // Find module by moduleKey
        const module = await tx.module.findUnique({
          where: { moduleKey: p.moduleKey },
        });
        
        if (!module) continue;

        const result = await tx.modulePermission.upsert({
          where: {
            refRoleId_refModuleId: {
              refRoleId: roleId,
              refModuleId: module.id,
            },
          },
          update: {
            canView: p.canView,
            canCreate: p.canCreate,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
          },
          create: {
            refRoleId: roleId,
            refModuleId: module.id,
            canView: p.canView,
            canCreate: p.canCreate,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
          },
        });
        results.push(result);
      }
      return results;
    });
  }

  async checkPermission(
    roleId: number,
    moduleKey: string,
    action: 'view' | 'create' | 'update' | 'delete',
  ) {
    const module = await this.prisma.module.findUnique({
      where: { moduleKey },
    });

    if (!module) return false;

    const perm = await this.prisma.modulePermission.findUnique({
      where: { refRoleId_refModuleId: { refRoleId: roleId, refModuleId: module.id } },
    });

    if (!perm) return false;

    return action === 'view' ? perm.canView :
           action === 'create' ? perm.canCreate :
           action === 'update' ? perm.canUpdate :
           action === 'delete' ? perm.canDelete : false;
  }

  async checkPermissionForUser(
    userId: number,
    moduleKey: string,
    action: 'view' | 'create' | 'update' | 'delete',
  ): Promise<boolean> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { refUserId: userId },
      select: { refRoleId: true },
    });

    if (!userRoles.length) return false;

    for (const { refRoleId } of userRoles) {
      const allowed = await this.checkPermission(refRoleId, moduleKey, action);
      if (allowed) return true;
    }

    return false;
  }
}
