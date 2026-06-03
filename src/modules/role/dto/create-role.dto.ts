import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { RoleType } from '../../../../generated/prisma/enums';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  roleName: string;

  @ApiProperty({ enum: RoleType })
  @IsEnum(RoleType)
  roleType: RoleType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
