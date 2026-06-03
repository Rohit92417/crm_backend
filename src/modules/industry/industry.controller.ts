import { Body, Controller, Get, Post, Patch, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Industry')
@Controller('industries')
export class IndustryController {
  constructor(private service: IndustryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all industries' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get industry by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new industry' })
  create(@Body() dto: CreateIndustryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update industry' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIndustryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete industry' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
