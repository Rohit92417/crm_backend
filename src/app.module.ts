import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { StorageService, LocalStorageService } from './common/storage/storage.service';
import { CountryModule } from './modules/location/country/country.module';
import { PrismaModule } from './prisma/prisma.module';
import { StateModule } from './modules/location/state/state.module';
import { CityModule } from './modules/location/city/city.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { PickupModule } from './modules/pickup/pickup.module';
import { RdModule } from './modules/rd/rd.module';
import { IndustryModule } from './modules/industry/industry.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ModulePermissionModule } from './modules/module-permission/module-permission.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { BranchModule } from './modules/branch/branch.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        // Global default: 60 requests per 60 s (generous for normal use)
        { name: 'global', ttl: 60_000, limit: 60 },
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule,
    PrismaModule,
    AuthModule,
    CompanyModule,
    IndustryModule,
    CountryModule,
    StateModule,
    CityModule,
    NotificationModule,
    PickupModule,
    RdModule,
    RoleModule,
    UserModule,
    DashboardModule,
    ModulePermissionModule,
    AuditLogModule,
    BranchModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Swap LocalStorageService → S3StorageService here to change storage backend.
    // See StorageService (common/storage/storage.service.ts) for the swap guide.
    { provide: StorageService, useClass: LocalStorageService },
  ],
  exports: [StorageService],
})
export class AppModule { }
