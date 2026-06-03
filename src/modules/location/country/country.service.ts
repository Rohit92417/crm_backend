import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CountryResponseDto } from './dto';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(public readonly prismaService: PrismaService) {}

  async findAll(): Promise<CountryResponseDto[]> {
    try {
      const countries = await this.prismaService.country.findMany({
        select: {
          id: true,
          countryName: true,
          createdAt: true,
        },
        orderBy: {
          countryName: 'asc',
        },
      });
      return countries;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Error fetching countries: ${err.message ?? 'Unknown error'}`,
        err.stack ?? '',
      );
      throw error;
    }
  }
}
