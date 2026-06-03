import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    email?: string;
    role?: string;
  };
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) { }

  // Create new user (Admin only)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('CRM_ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Get all users
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Get current authenticated user
  @Get('me')
  getMe(@Request() req: RequestWithUser) {
    return this.userService.getUserById(req.user.id);
  }

  // Get single user by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // Update own profile information
  @Patch('profile')
  updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.id;

    return this.userService.updateProfile(userId, updateProfileDto);
  }

  // Update own profile photo
  @Patch('profile/photo')
  @UseInterceptors(FileInterceptor('photo'))
  updateProfilePhoto(
    @Request() req: RequestWithUser,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    const userId = req.user.id;

    return this.userService.updateProfilePhoto(userId, photo);
  }

  // Update user by ID (Admin only)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('CRM_ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // Update user photo by ID (Admin only)
  @Patch(':id/photo')
  @UseGuards(RolesGuard)
  @Roles('CRM_ADMIN')
  @UseInterceptors(FileInterceptor('photo'))
  updateUserPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.userService.updateProfilePhoto(id, photo);
  }

  // Delete user (soft delete)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('CRM_ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

}