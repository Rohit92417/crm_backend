import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  @Roles('CRM_ADMIN')
  @ApiOperation({ summary: 'Create audit log entry' })
  create(@Body() createDto: CreateAuditLogDto) {
    return this.auditLogService.create(createDto);
  }

  @Get()
  @Roles('CRM_ADMIN')
  @ApiOperation({ summary: 'Get all audit logs with filters' })
  @ApiQuery({ name: 'refUserId', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(
    @Query('refUserId') refUserId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (refUserId) filters.refUserId = parseInt(refUserId);
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.auditLogService.findAll(filters);
  }

  @Get('stats/actions')
  @Roles('CRM_ADMIN')
  @ApiOperation({ summary: 'Get action statistics' })
  getActionStats() {
    return this.auditLogService.getActionStats();
  }

  @Get('user/:userId')
  @Roles('CRM_ADMIN')
  @ApiOperation({ summary: 'Get audit logs by user' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.auditLogService.findByUser(userId);
  }

  @Get('entity/:entityType/:entityId')
  @Roles('CRM_ADMIN')
  @ApiOperation({ summary: 'Get audit logs by entity' })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.auditLogService.findByEntity(entityType, entityId);
  }
}
