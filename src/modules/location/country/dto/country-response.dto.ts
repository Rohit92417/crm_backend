import { ApiProperty } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty({ description: 'Country ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Country name', example: 'United States' })
  countryName: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
