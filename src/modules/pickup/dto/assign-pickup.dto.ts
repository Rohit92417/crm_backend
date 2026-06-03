import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class AssignPickupDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  refAssignedToUserId: number;

  @ApiPropertyOptional({ example: '2025-01-20T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledPickupAt?: string;
}
