import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CompletePickupItemDto {
  @ApiPropertyOptional({ example: 'Plastic' })
  @IsString()
  @IsOptional()
  materialType?: string;

  @ApiPropertyOptional({ example: 145.2 })
  @IsNumber()
  @IsOptional()
  auditWeight?: number;

  @ApiPropertyOptional({ example: 9 })
  @IsInt()
  @IsOptional()
  auditBags?: number;
}

export class CompletePickupDto {
  @ApiPropertyOptional({ example: '2025-01-20T14:30:00Z' })
  @IsDateString()
  @IsOptional()
  actualPickupAt?: string;

  @ApiPropertyOptional({ example: ['url1', 'url2'] })
  @IsArray()
  @IsOptional()
  pickupImages?: string[];

  @ApiPropertyOptional({ example: 'Pickup completed successfully' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ type: [CompletePickupItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompletePickupItemDto)
  @IsOptional()
  items?: CompletePickupItemDto[];
}
