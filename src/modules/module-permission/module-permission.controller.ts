import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModulePermissionService } from './module-permission.service';
import { UpdateModulePermissionDto } from './dto/update-permission.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Permissions')
@Controller('module-permissions')
@UseGuards(AuthGuard('jwt'))
export class ModulePermissionController {
  constructor(private readonly service: ModulePermissionService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get current user module permissions' })
  async getMyPermissions(@Req() req) {
    return this.service.getMyPermissions(req.user.id as number);
  }

  @Get('module-keys')
  @ApiOperation({ summary: 'Get all available module keys' })
  getAllModuleKeys() {
    return this.service.getAllModuleKeys();
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Find all module permissions for a specific role' })
  async findByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.service.findAllByRole(roleId);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Synchronize a matrix of module permissions for a role',
  })
  async bulkUpdate(
    @Body('roleId', ParseIntPipe) roleId: number,
    @Body('permissions') permissions: UpdateModulePermissionDto[],
  ) {
    return this.service.bulkUpdate(roleId, permissions);
  }
}
