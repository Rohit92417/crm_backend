import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty()
  @IsString()
  industryName: string;
}
