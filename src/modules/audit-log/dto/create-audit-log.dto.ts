import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  refUserId: number;

  @ApiProperty({ example: 'CRM_ADMIN', enum: ['CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER'] })
  @IsEnum(['CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER'])
  userType: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  userName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  userEmail: string;

  @ApiProperty({ example: 'CREATE', enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] })
  @IsString()
  action: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  entityType: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  entityId?: number;

  @ApiPropertyOptional({ example: { name: 'Old Name' } })
  @IsOptional()
  oldValues?: any;

  @ApiPropertyOptional({ example: { name: 'New Name' } })
  @IsOptional()
  newValues?: any;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
