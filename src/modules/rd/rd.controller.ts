import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RdService } from './rd.service';
import { CreateRdDto } from './dto/create-rd.dto';
import { UpdateRdDto } from './dto/update-rd.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('RD')
@Controller('rds')
export class RdController {
  constructor(private service: RdService) {}

  @Post()
  create(@Body() dto: CreateRdDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(dto, user?.id);
  }

  @Post('bulk')
  createMany(@Body() dtos: CreateRdDto[], @CurrentUser() user: CurrentUserData) {
    return this.service.createMany(dtos, user?.id);
  }

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('by-company/:companyId')
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.service.findByCompany(companyId);
  }

  @Get('by-branch/:branchId')
  findByBranch(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.service.findByBranch(branchId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRdDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
