import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateModulePermissionDto {
  @ApiProperty() @IsNumber() refRoleId: number;
  @ApiProperty() @IsString() moduleKey: string;
  @ApiProperty() @IsBoolean() canView: boolean;
  @ApiProperty() @IsBoolean() canCreate: boolean;
  @ApiProperty() @IsBoolean() canUpdate: boolean;
  @ApiProperty() @IsBoolean() canDelete: boolean;
}

export class BulkUpdatePermissionsDto {
  @ApiProperty() @IsNumber() refRoleId: number;
  permissions: UpdateModulePermissionDto[];
}
