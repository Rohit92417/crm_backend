import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBranchDto, userId: number) {
    const company = await this.prisma.company.findUnique({ where: { id: dto.refCompanyId } });
    if (!company) throw new NotFoundException('Company not found');

    return this.prisma.branchInfo.create({
      data: {
        refCompanyId: dto.refCompanyId,
        branchName: dto.branchName,
        branchType: dto.branchType,
        createdBy: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.branchInfo.findMany({
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { rdInfo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCompany(companyId: number) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');

    return this.prisma.branchInfo.findMany({
      where: { refCompanyId: companyId },
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { rdInfo: true } },
      },
      orderBy: { branchName: 'asc' },
    });
  }

  async findOne(id: number) {
    const branch = await this.prisma.branchInfo.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, email: true } },
        rdInfo: {
          where: { isDeleted: false },
          include: {
            state: { select: { stateName: true } },
            country: { select: { countryName: true } },
          },
        },
        _count: { select: { rdInfo: true, pickups: true } },
      },
    });

    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async findRdsByBranch(branchId: number) {
    const branch = await this.prisma.branchInfo.findUnique({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');

    return this.prisma.rDInfo.findMany({
      where: { refBranchInfoId: branchId, isDeleted: false },
      include: {
        state: { select: { stateName: true } },
        country: { select: { countryName: true } },
        // city: { select: { cityName: true } },
      },
      orderBy: { rdName: 'asc' },
    });
  }

  async update(id: number, dto: UpdateBranchDto) {
    const branch = await this.prisma.branchInfo.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');

    return this.prisma.branchInfo.update({
      where: { id },
      data: dto,
      include: {
        company: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: number) {
    const branch = await this.prisma.branchInfo.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');

    const rdCount = await this.prisma.rDInfo.count({ where: { refBranchInfoId: id } });
    if (rdCount > 0) {
      throw new BadRequestException(
        `Cannot delete branch. It has ${rdCount} RD(s) associated with it. Please delete them first.`,
      );
    }

    const pickupCount = await this.prisma.pickup.count({ where: { refBranchInfoId: id } });
    if (pickupCount > 0) {
      throw new BadRequestException(
        `Cannot delete branch. It has ${pickupCount} pickup(s) associated with it.`,
      );
    }

    return this.prisma.branchInfo.delete({ where: { id } });
  }
}
