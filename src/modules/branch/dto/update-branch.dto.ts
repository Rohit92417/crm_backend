import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Mumbai Branch' })
  @IsString()
  @IsOptional()
  branchName?: string;

  @ApiPropertyOptional({ enum: ['Distributor', 'Warehouse'] })
  @IsString()
  @IsIn(['Distributor', 'Warehouse'])
  @IsOptional()
  branchType?: string;
}
