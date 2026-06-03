import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() address: string;
  @ApiProperty() @IsString() pinCode: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  refIndustryId?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() refCityId?: number;
  @ApiProperty() @IsInt() refStateId: number;
  @ApiProperty() @IsInt() refCountryId: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() logo?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gstNumber?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gstDocument?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  panNumber?: string;
}
