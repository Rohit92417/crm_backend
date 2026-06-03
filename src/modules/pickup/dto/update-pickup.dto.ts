import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PickupWorkflowStatus } from '../../../../generated/prisma/enums';

export class UpdatePickupDto {
  @ApiPropertyOptional({ enum: PickupWorkflowStatus })
  @IsEnum(PickupWorkflowStatus)
  @IsOptional()
  workflowStatus?: string;

  @ApiPropertyOptional({ example: 'Pickup rescheduled due to weather' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ example: '2025-01-20T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledPickupAt?: string;
}
