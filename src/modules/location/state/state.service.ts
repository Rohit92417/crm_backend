import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StateService {
  constructor(private prisma: PrismaService) {}

  async findByCountry(countryId: number) {
    return this.prisma.state.findMany({
      where: { refCountryId: countryId },
      orderBy: { stateName: 'asc' },
    });
  }
}
