import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { CreateRdDto } from './dto/create-rd.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RdService {
  constructor(private prisma: PrismaService) { }

  private async resolveOrCreateDefaultBranch(
    refCompanyId: number,
    createdByUserId?: number,
  ): Promise<number> {
    const existing = await this.prisma.branchInfo.findFirst({
      where: { refCompanyId },
    });
    if (existing) return existing.id;

    const company = await this.prisma.company.findUnique({
      where: { id: refCompanyId },
      select: { refOwnerUserId: true },
    });
    const createdBy = createdByUserId ?? company?.refOwnerUserId ?? 0;
    const branch = await this.prisma.branchInfo.create({
      data: {
        refCompanyId,
        branchName: 'Default Branch',
        branchType: 'Distributor',
        createdBy,
      },
    });
    return branch.id;
  }

  async create(dto: CreateRdDto, userId?: number) {
    const refBranchInfoId =
      dto.refBranchInfoId ??
      (await this.resolveOrCreateDefaultBranch(dto.refCompanyId, userId));

    const { refBranchInfoId: _b, ...rest } = dto;
    return this.prisma.rDInfo.create({
      data: {
        ...rest,
        refBranchInfoId,
        cityName: dto.cityName ?? '',
      } as Prisma.RDInfoUncheckedCreateInput,
    });
  }

  async createMany(dtos: CreateRdDto[], userId?: number) {
    const results = [];
    for (const dto of dtos) {
      results.push(await this.create(dto, userId));
    }
    return results;
  }

  async findAll() {
    return this.prisma.rDInfo.findMany({
      where: { isDeleted: false },
      include: {
        state: true,
        country: true,
        company: { select: { id: true, name: true } },
        branchInfo: { select: { id: true, branchName: true, branchType: true } },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.rDInfo.findUnique({
      where: { id },
      include: {
        // city: true,
        state: true,
        country: true,
      },
    });
  }

  async findByCompany(companyId: number) {
    return this.prisma.rDInfo.findMany({
      where: { refCompanyId: companyId, isDeleted: false },
      include: {
        state: true,
        country: true,
        company: { select: { id: true, name: true } },
        branchInfo: { select: { id: true, branchName: true, branchType: true } },
      },
    });
  }

  async findByBranch(branchId: number) {
    return this.prisma.rDInfo.findMany({
      where: { refBranchInfoId: branchId, isDeleted: false },
      include: {
        // city: true,
        state: true,
        country: true,
      },
      orderBy: { rdName: 'asc' },
    });
  }

  async update(id: number, dto: any) {
    return this.prisma.rDInfo.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.rDInfo.delete({
      where: { id },
    });
  }
}
