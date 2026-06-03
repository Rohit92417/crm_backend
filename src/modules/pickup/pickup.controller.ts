import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PickupService } from './pickup.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { UpdatePickupDto } from './dto/update-pickup.dto';
import { AssignPickupDto } from './dto/assign-pickup.dto';
import { CompletePickupDto } from './dto/complete-pickup.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Pickups')
@ApiBearerAuth()
@Controller('pickups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PickupController {
  constructor(private readonly pickupService: PickupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pickup (CRM users only)' })
  @Roles('CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER')
  create(@Body() createDto: CreatePickupDto, @CurrentUser() user: CurrentUserData) {
    return this.pickupService.create(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pickups' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'rdId', required: false })
  @ApiQuery({ name: 'statusId', required: false })
  @ApiQuery({ name: 'assignedToUserId', required: false })
  findAll(@CurrentUser() user: CurrentUserData, @Query() filters: any) {
    return this.pickupService.findAll(user, filters);
  }

  @Get('my-pickups')
  @ApiOperation({ summary: 'Get pickups assigned to me (Field agents)' })
  @Roles('CRM_USER', 'CRM_ADMIN')
  getMyPickups(@CurrentUser() user: CurrentUserData) {
    return this.pickupService.getMyPickups(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pickup by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.pickupService.findOne(+id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pickup status and remark' })
  @Roles('CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePickupDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.pickupService.update(+id, updateDto, user);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign pickup to field agent (CRM users only)' })
  @Roles('CRM_ADMIN', 'CRM_USER')
  assign(
    @Param('id') id: string,
    @Body() assignDto: AssignPickupDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.pickupService.assign(+id, assignDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pickup' })
  @Roles('CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.pickupService.remove(+id, user);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete pickup (Assigned field agent)' })
  @Roles('CRM_USER', 'CRM_ADMIN')
  complete(
    @Param('id') id: string,
    @Body() completeDto: CompletePickupDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.pickupService.complete(+id, completeDto, user);
  }

  @Post(':id/audit-documents')
  @ApiOperation({ summary: 'Upload audit documentation evidence (images & documents)' })
  @ApiConsumes('multipart/form-data')
  @Roles('CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER')
  @UseInterceptors(
    FilesInterceptor('auditDocuments', 10, {
      storage: diskStorage({
        destination: './uploads/pickup/audit',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadAuditDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.pickupService.uploadAuditDocuments(+id, files, user);
  }
}
