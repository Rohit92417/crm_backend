import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StorageService, LocalStorageService } from '../../common/storage/storage.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: StorageService, useClass: LocalStorageService },
  ],
})
export class UserModule {}
