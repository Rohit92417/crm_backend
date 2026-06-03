import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatePickupItemDto {
  @ApiPropertyOptional({ example: 'Plastic' })
  @IsString()
  @IsOptional()
  materialType?: string;

  @ApiPropertyOptional({ example: 150.5 })
  @IsNumber()
  @IsOptional()
  auditWeight?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @IsOptional()
  auditBags?: number;
}

export class CreatePickupDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  refCompanyId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  refRDId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  refBranchInfoId?: number;

  @ApiPropertyOptional({ example: 'audit-image-url.jpg' })
  @IsString()
  @IsOptional()
  auditImages?: string;

  @ApiPropertyOptional({ example: 'Pre-pickup notes' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ type: [CreatePickupItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePickupItemDto)
  @IsOptional()
  items?: CreatePickupItemDto[];
}
