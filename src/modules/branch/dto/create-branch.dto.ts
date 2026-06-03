import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  refCompanyId: number;

  @ApiProperty({ example: 'Delhi Branch' })
  @IsString()
  @IsNotEmpty()
  branchName: string;

  @ApiProperty({ enum: ['Distributor', 'Warehouse'], example: 'Distributor' })
  @IsString()
  @IsIn(['Distributor', 'Warehouse'])
  branchType: string;
}
