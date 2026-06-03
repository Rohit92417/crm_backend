import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { UpdatePickupDto } from './dto/update-pickup.dto';
import { AssignPickupDto } from './dto/assign-pickup.dto';
import { CompletePickupDto } from './dto/complete-pickup.dto';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { PickupWorkflowStatus } from '../../../generated/prisma/enums';

// Intermediate type for building the pickup update payload incrementally.
type PickupUpdateData = {
  refUpdatedByUserId: number;
  workflowStatus?: PickupWorkflowStatus;
  remark?: string | null;
  scheduledPickupAt?: Date | null;
};

const pickupIncludeBase = {
  company: { select: { id: true, name: true } },
  rd: { select: { id: true, rdCode: true, rdName: true, address: true, cityName: true } },
  branchInfo: { select: { id: true, branchName: true, branchType: true } },
};

@Injectable()
export class PickupService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreatePickupDto, user: CurrentUserData) {
    const allowedTypes = ['CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN'];
    if (!allowedTypes.includes(user.userType)) {
      throw new ForbiddenException('You do not have permission to create pickups');
    }

    // Serializable isolation prevents two concurrent creates from racing on the
    // same pickup-number prefix. One will retry automatically; throughput is
    // acceptable because pickup creation is low-frequency.
    return this.prisma.$transaction(
      async (tx) => {
        const pickupNumber = await this.generatePickupNumber(tx);

        const pickup = await tx.pickup.create({
          data: {
            pickupNumber,
            refCompanyId: createDto.refCompanyId,
            refRDId: createDto.refRDId,
            refBranchInfoId: createDto.refBranchInfoId,
            workflowStatus: PickupWorkflowStatus.DRAFT,
            approvalStatus: 'PENDING',
            auditImages: createDto.auditImages,
            remark: createDto.remark,
            refCreatedByUserId: user.id,
            items: createDto.items?.length
              ? { create: createDto.items }
              : undefined,
          },
          include: {
            ...pickupIncludeBase,
            createdBy: { select: { id: true, name: true, email: true } },
            items: true,
          },
        });

        return { message: 'Pickup created successfully', pickup };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async findAll(user: CurrentUserData, filters?: Record<string, string>) {
    const where: Prisma.PickupWhereInput = {};
    const isClient = user.userType === 'CLIENT_ADMIN' || user.userType === 'CLIENT_USER';

    if (isClient) {
      if (user.refCompanyId === null) return [];
      where.refCompanyId = user.refCompanyId;
    } else {
      if (filters?.companyId) where.refCompanyId = parseInt(filters.companyId);
    }

    if (filters?.rdId) where.refRDId = parseInt(filters.rdId);
    if (filters?.branchId) where.refBranchInfoId = parseInt(filters.branchId);
    if (filters?.workflowStatus) where.workflowStatus = filters.workflowStatus as PickupWorkflowStatus;

    return this.prisma.pickup.findMany({
      where,
      include: {
        ...pickupIncludeBase,
        items: true,
      },
      orderBy: { scheduledPickupAt: 'desc' },
    });
  }

  async findOne(id: number, user: CurrentUserData) {
    const pickup = await this.prisma.pickup.findUnique({
      where: { id },
      include: {
        company: true,
        rd: true,
        branchInfo: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
        items: true,
        approvals: {
          include: { approvedBy: { select: { id: true, name: true, email: true } } },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!pickup) throw new NotFoundException('Pickup not found');

    if (user.userType !== 'CRM_ADMIN' && user.userType !== 'CRM_USER') {
      if (pickup.refCompanyId !== user.refCompanyId) throw new ForbiddenException('Access denied');
    }

    return pickup;
  }

  async assign(id: number, assignDto: AssignPickupDto, user: CurrentUserData) {
    if (user.userType !== 'CRM_ADMIN' && user.userType !== 'CRM_USER') {
      throw new ForbiddenException('Only CRM users can assign pickups');
    }

    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) throw new NotFoundException('Pickup not found');

    const updated = await this.prisma.pickup.update({
      where: { id },
      data: {
        scheduledPickupAt: assignDto.scheduledPickupAt
          ? new Date(assignDto.scheduledPickupAt)
          : undefined,
        workflowStatus: PickupWorkflowStatus.ASSIGNED,
        refUpdatedByUserId: user.id,
      },
      include: pickupIncludeBase,
    });

    await this.prisma.pickupLog.create({
      data: {
        refPickupId: id,
        action: 'ASSIGNED',
        refUserId: user.id,
        userName: user.name,
        userEmail: user.email,
        userType: user.userType as any,
        afterData: { assignedToUserId: assignDto.refAssignedToUserId } as any,
        changedFields: ['workflowStatus'],
      },
    });

    return { message: 'Pickup assigned successfully', pickup: updated };
  }

  async complete(id: number, completeDto: CompletePickupDto, user: CurrentUserData) {
    if (user.userType !== 'CRM_ADMIN' && user.userType !== 'CRM_USER') {
      throw new ForbiddenException('Only CRM users can complete pickups');
    }

    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) throw new NotFoundException('Pickup not found');

    const updated = await this.prisma.pickup.update({
      where: { id },
      data: {
        actualPickupAt: completeDto.actualPickupAt
          ? new Date(completeDto.actualPickupAt)
          : new Date(),
        pickupImages: completeDto.pickupImages ?? undefined,
        remark: completeDto.remark,
        workflowStatus: PickupWorkflowStatus.COMPLETED,
        refUpdatedByUserId: user.id,
        ...(completeDto.items?.length
          ? {
            items: {
              deleteMany: {},
              create: completeDto.items,
            },
          }
          : {}),
      },
      include: {
        ...pickupIncludeBase,
        items: true,
      },
    });

    return { message: 'Pickup completed successfully', pickup: updated };
  }

  async uploadAuditDocuments(
    id: number,
    files: Express.Multer.File[],
    user: CurrentUserData,
  ) {
    if (!files?.length) {
      throw new BadRequestException('No audit documents provided');
    }

    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) throw new NotFoundException('Pickup not found');

    // Clients may only attach documents to their own company's pickups.
    if (user.userType === 'CLIENT_ADMIN' || user.userType === 'CLIENT_USER') {
      if (pickup.refCompanyId !== user.refCompanyId) {
        throw new ForbiddenException('Access denied');
      }
    }

    // `auditImages` is a String column that stores a JSON-encoded array of file
    // paths. Append the newly uploaded files to whatever is already stored so
    // repeated uploads accumulate rather than overwrite.
    const existing = this.parseAuditImages(pickup.auditImages);
    const paths = [...existing, ...files.map((f) => f.path)];

    const updated = await this.prisma.pickup.update({
      where: { id },
      data: {
        auditImages: JSON.stringify(paths),
        refUpdatedByUserId: user.id,
      },
      include: {
        ...pickupIncludeBase,
        items: true,
      },
    });

    return { message: 'Audit documents uploaded successfully', pickup: updated };
  }

  private parseAuditImages(value: string | null): string[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      // Legacy single-path value stored before JSON encoding was introduced.
      return [value];
    }
  }

  async update(id: number, updateDto: UpdatePickupDto, user: CurrentUserData) {
    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) throw new NotFoundException('Pickup not found');

    if (user.userType === 'CLIENT_ADMIN' || user.userType === 'CLIENT_USER') {
      if (pickup.refCompanyId !== user.refCompanyId) throw new ForbiddenException('Access denied');
    }

    const updateData: PickupUpdateData = { refUpdatedByUserId: user.id };

    if (updateDto.workflowStatus) {
      if (!Object.values(PickupWorkflowStatus).includes(updateDto.workflowStatus as PickupWorkflowStatus)) {
        throw new BadRequestException(`Invalid workflowStatus: ${updateDto.workflowStatus}`);
      }
      updateData.workflowStatus = updateDto.workflowStatus as PickupWorkflowStatus;
    }

    if (updateDto.remark !== undefined) updateData.remark = updateDto.remark;
    if (updateDto.scheduledPickupAt !== undefined)
      updateData.scheduledPickupAt = updateDto.scheduledPickupAt
        ? new Date(updateDto.scheduledPickupAt)
        : null;

    const updated = await this.prisma.pickup.update({
      where: { id },
      data: updateData,
      include: pickupIncludeBase,
    });

    return { message: 'Pickup updated successfully', pickup: updated };
  }

  async getMyPickups(user: CurrentUserData) {
    if (user.userType !== 'CRM_USER' && user.userType !== 'CRM_ADMIN') {
      throw new ForbiddenException('Only CRM users can access this endpoint');
    }

    return this.prisma.pickup.findMany({
      where: { refCreatedByUserId: user.id },
      include: {
        company: { select: { id: true, name: true } },
        rd: { select: { id: true, rdCode: true, rdName: true, address: true, contactPersonPhone: true } },
        items: true,
      },
      orderBy: { scheduledPickupAt: 'asc' },
    });
  }

  async remove(id: number, user: CurrentUserData) {
    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) throw new NotFoundException('Pickup not found');

    if (user.userType !== 'CRM_ADMIN' && user.userType !== 'CRM_USER') {
      if (pickup.refCompanyId !== user.refCompanyId) throw new ForbiddenException('Access denied');
    }

    return this.prisma.pickup.delete({ where: { id } });
  }

  private async generatePickupNumber(tx: Prisma.TransactionClient): Promise<string> {
    const now = new Date();
    const dateStr =
      String(now.getFullYear()) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const prefix = `PK-${dateStr}`;

    // COUNT within the serializable transaction gives a stable read — no other
    // transaction can insert a new row with this prefix until we commit.
    const existing = await tx.pickup.count({
      where: { pickupNumber: { startsWith: prefix } },
    });

    return `${prefix}-${(existing + 1).toString().padStart(4, '0')}`;
  }
}
