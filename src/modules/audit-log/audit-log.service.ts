import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UserType } from '../../../generated/prisma/enums';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAuditLogDto) {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        refUserId: createDto.refUserId,
        userType: createDto.userType as UserType,
        userName: createDto.userName,
        userEmail: createDto.userEmail,
        action: createDto.action,
        entityType: createDto.entityType,
        entityId: createDto.entityId,
        oldValues: createDto.oldValues ? JSON.stringify(createDto.oldValues) : null,
        newValues: createDto.newValues ? JSON.stringify(createDto.newValues) : null,
        ipAddress: createDto.ipAddress,
        userAgent: createDto.userAgent,
      },
    });

    return {
      message: 'Audit log created successfully',
      data: auditLog,
    };
  }

  async findAll(filters?: {
    refUserId?: number;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.refUserId) where.refUserId = filters.refUserId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      message: 'Audit logs retrieved successfully',
      data: logs,
      count: logs.length,
    };
  }

  async findByUser(userId: number) {
    const logs = await this.prisma.auditLog.findMany({
      where: { refUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      message: 'User audit logs retrieved successfully',
      data: logs,
      count: logs.length,
    };
  }

  async findByEntity(entityType: string, entityId: number) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Entity audit logs retrieved successfully',
      data: logs,
      count: logs.length,
    };
  }

  async getActionStats() {
    const stats = await this.prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });

    return {
      message: 'Action statistics retrieved successfully',
      data: stats,
    };
  }
}
