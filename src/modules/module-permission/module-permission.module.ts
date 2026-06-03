import { Module } from '@nestjs/common';
import { ModulePermissionService } from './module-permission.service';
import { ModulePermissionController } from './module-permission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModulePermissionController],
  providers: [ModulePermissionService],
  exports: [ModulePermissionService],
})
export class ModulePermissionModule {}
