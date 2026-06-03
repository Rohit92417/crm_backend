import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { GenderCategory } from '../../../../generated/prisma/enums';

export class RegisterClientDto {
  /**
   * Company Data
   */

  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsEmail()
  companyEmail: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  pinCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  refIndustryId?: number;

  @ApiProperty()
  @IsString()
  cityName: string;

  @ApiProperty()
  @IsInt()
  refStateId: number;

  @ApiProperty()
  @IsInt()
  refCountryId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyPhoneCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  panNumber?: string;

  /**
   * User Data
   */

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneCode?: string;

  @ApiProperty({ enum: GenderCategory })
  @IsEnum(GenderCategory)
  gender: GenderCategory;
}