import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a branch for a company (CRM_ADMIN)' })
  @Roles('CRM_ADMIN')
  create(@Body() dto: CreateBranchDto, @CurrentUser() user: CurrentUserData) {
    return this.branchService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @Roles('CRM_ADMIN', 'CRM_USER')
  findAll() {
    return this.branchService.findAll();
  }

  @Get('by-company/:companyId')
  @ApiOperation({ summary: 'Get branches for a specific company' })
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.branchService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch details with its RDs' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchService.findOne(id);
  }

  @Get(':branchId/rds')
  @ApiOperation({ summary: 'Get all RDs under a specific branch' })
  findRdsByBranch(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.branchService.findRdsByBranch(branchId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch (CRM_ADMIN)' })
  @Roles('CRM_ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch (CRM_ADMIN)' })
  @Roles('CRM_ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchService.remove(id);
  }
}
