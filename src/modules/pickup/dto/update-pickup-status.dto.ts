import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePickupStatusDto {
  @ApiProperty()
  @IsInt()
  refPickupStatusId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pickupWeight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  pickupNoOfBags?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pickupRemark?: string;
}
