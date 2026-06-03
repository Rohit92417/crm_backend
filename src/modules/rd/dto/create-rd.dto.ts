import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRdDto {
  @ApiProperty() @IsString() rdCode: string;
  @ApiProperty() @IsString() rdName: string;

  @ApiProperty() @IsString() contactPersonName: string;
  @ApiProperty() @IsString() contactPersonPhone: string;
  @ApiProperty() @IsEmail() contactPersonEmail: string;

  @ApiProperty() @IsString() address: string;

  @ApiPropertyOptional() @IsString() @IsOptional() landmark?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() pincode?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() cityName?: string;
  @ApiPropertyOptional() @IsInt() @IsOptional() refStateId?: number;
  @ApiProperty() @IsInt() refCountryId: number;
  @ApiProperty() @IsInt() refCompanyId: number;

  @ApiPropertyOptional() @IsInt() @IsOptional() refBranchInfoId?: number;
}
