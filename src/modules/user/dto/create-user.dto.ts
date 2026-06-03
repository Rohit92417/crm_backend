import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';

export enum UserType {
  CRM_ADMIN = 'CRM_ADMIN',
  CRM_USER = 'CRM_USER',
  CLIENT_ADMIN = 'CLIENT_ADMIN',
  CLIENT_USER = 'CLIENT_USER',
}

export enum GenderCategory {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  phoneCode?: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @IsOptional()
  @IsEnum(GenderCategory)
  gender?: GenderCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  refCompanyId?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  roleId?: number;

  @IsOptional()
  photo?: string;
}