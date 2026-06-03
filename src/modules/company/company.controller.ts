import { Body, Controller, Get, Param, Post, Patch, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Company')
@Controller('companies')
export class CompanyController {
  constructor(private service: CompanyService) { }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  create(@Body() dto: RegisterClientDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company status (activate/deactivate)' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.service.updateStatus(id, isActive);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete company' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CRM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload organization documents' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'panDocument', maxCount: 1 },
        { name: 'gstDocument', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/organization/document',
          filename: (req, file, cb) => {
            const uniqueName =
              Date.now() + '-' + Math.round(Math.random() * 1e9);

            cb(null, `${uniqueName}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  uploadCompanyDocument(
    @Param('id', ParseIntPipe) id: number,

    @UploadedFiles()
    files: {
      panDocument?: Express.Multer.File[];
      gstDocument?: Express.Multer.File[];
      logo?: Express.Multer.File[];
    },
  ) {
    return this.service.uploadCompanyDocument(id, files);
  }
}
