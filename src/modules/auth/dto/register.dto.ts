import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsInt, IsDateString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ['Male', 'Female', 'Other'] })
  @IsEnum(['Male', 'Female', 'Other'])
  @IsOptional()
  gender?: 'Male' | 'Female' | 'Other';

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER'] })
  @IsEnum(['CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER'])
  @IsNotEmpty()
  userType: 'CRM_ADMIN' | 'CRM_USER' | 'CLIENT_ADMIN' | 'CLIENT_USER';

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  refCompanyId?: number;

}
