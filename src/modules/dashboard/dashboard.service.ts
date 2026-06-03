import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { PickupWorkflowStatus } from '../../../generated/prisma/enums';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [userCount, companyCount, pickupCount, pendingCount, recentPickups, statusCounts] =
      await Promise.all([
        this.prisma.user.count({ where: { isDeleted: false } }),
        this.prisma.company.count(),
        this.prisma.pickup.count(),
        this.prisma.pickup.count({ where: { workflowStatus: PickupWorkflowStatus.PENDING_APPROVAL } }),
        this.prisma.pickup.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            rd: { select: { id: true, rdName: true, rdCode: true } },
            company: { select: { id: true, name: true } },
          },
        }),
        this.prisma.pickup.groupBy({
          by: ['workflowStatus'],
          _count: { _all: true },
        }),
      ]);

    const statusDistribution = statusCounts.map((s) => ({
      status: s.workflowStatus,
      count: s._count._all,
    }));

    return {
      userCount,
      companyCount,
      pickupCount,
      pendingCount,
      recentPickups,
      statusDistribution,
    };
  }

  async getClientStats(userId: number, companyId?: number) {
    const pickupWhere: Prisma.PickupWhereInput = companyId
      ? { refCompanyId: companyId }
      : { refCreatedByUserId: userId };

    const rdWhere: Prisma.RDInfoWhereInput = companyId ? { refCompanyId: companyId } : {};

    const [rdCount, pickupCount, activeCount, completedCount, recentPickups, statusCounts] =
      await Promise.all([
        this.prisma.rDInfo.count({ where: rdWhere }),
        this.prisma.pickup.count({ where: pickupWhere }),
        this.prisma.pickup.count({
          where: {
            ...pickupWhere,
            workflowStatus: { in: [PickupWorkflowStatus.ASSIGNED, PickupWorkflowStatus.IN_PROGRESS] },
          },
        }),
        this.prisma.pickup.count({
          where: { ...pickupWhere, workflowStatus: PickupWorkflowStatus.COMPLETED },
        }),
        this.prisma.pickup.findMany({
          where: pickupWhere,
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            rd: { select: { id: true, rdName: true, rdCode: true } },
          },
        }),
        this.prisma.pickup.groupBy({
          by: ['workflowStatus'],
          where: pickupWhere,
          _count: { _all: true },
        }),
      ]);

    const statusDistribution = statusCounts.map((s) => ({
      status: s.workflowStatus,
      count: s._count._all,
    }));

    return {
      rdCount,
      pickupCount,
      activeCount,
      completedCount,
      recentPickups,
      statusDistribution,
    };
  }
}
