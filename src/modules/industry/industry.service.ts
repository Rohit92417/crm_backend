import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';

@Injectable()
export class IndustryService {
  private readonly logger = new Logger(IndustryService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIndustryDto) {
    const exists = await this.prisma.industry.findUnique({
      where: { industryName: dto.industryName },
    });
    if (exists) throw new BadRequestException('Industry already exists');

    return this.prisma.industry.create({ data: dto });
  }

  async findAll() {
    return this.prisma.industry.findMany({
      orderBy: { industryName: 'asc' },
    });
  }

  async findOne(id: number) {
    const industry = await this.prisma.industry.findUnique({
      where: { id },
    });

    if (!industry) {
      throw new NotFoundException(`Industry with ID ${id} not found`);
    }

    return industry;
  }

  async update(id: number, dto: UpdateIndustryDto) {
    // Check if industry exists
    await this.findOne(id);

    // If updating name, check for duplicates
    if (dto.industryName) {
      const exists = await this.prisma.industry.findFirst({
        where: {
          industryName: dto.industryName,
          NOT: { id },
        },
      });

      if (exists) {
        throw new BadRequestException('Industry with this name already exists');
      }
    }

    return this.prisma.industry.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    // Check if industry exists
    await this.findOne(id);

    // Check if industry is being used by any companies
    const companiesCount = await this.prisma.company.count({
      where: { refIndustryId: id },
    });

    if (companiesCount > 0) {
      throw new BadRequestException(
        `Cannot delete industry. It is assigned to ${companiesCount} company(ies)`
      );
    }

    return this.prisma.industry.delete({
      where: { id },
    });
  }
}
