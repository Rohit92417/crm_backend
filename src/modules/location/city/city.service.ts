import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  async findByState(stateId: number) {
    return this.prisma.city.findMany({
      where: { refStateId: stateId },
      orderBy: { cityName: 'asc' },
    });
  }
}
