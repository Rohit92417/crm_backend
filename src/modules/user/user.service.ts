import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { roleId, password, email, phone, refCompanyId, ...restData } = createUserDto;

    // Check if user already exists
    const orConditions: { email?: string; phone?: string }[] = [{ email }];
    if (phone) orConditions.push({ phone });

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: orConditions,
        isDeleted: false,
      },
      select: { id: true, email: true, phone: true },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new BadRequestException('Email already exists');
      }
      if (existingUser.phone === phone) {
        throw new BadRequestException('Phone already exists');
      }
    }

    // Hash password — password is guaranteed non-null by @IsNotEmpty validator
    const hashedPassword = await bcrypt.hash(password!, 10);

    // Create user and assign role in transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...(restData as any),
          email: email!,
          password: hashedPassword,
          phone,

          ...(refCompanyId && {
            company: {
              connect: {
                id: refCompanyId,
              },
            },
          }),
        },

        select: {
          id: true
        },
      });

      // Assign role to user — roleId guaranteed non-null by @IsNotEmpty validator
      await tx.userRole.create({
        data: {
          refUserId: user.id,
          refRoleId: roleId!,
        },
      });

      return user;
    });
  }

  async findAll() {
    const data = await this.prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        userType: true,
        refCompanyId: true,
        isActive: true,
        photo: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                roleName: true,
                roleType: true,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return data;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        gender: true,
        photo: true,
        userType: true,
        refCompanyId: true,
        isActive: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                roleName: true,
                roleType: true,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDeleted: true },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const genderMap: Record<string, string> = {
      male: 'Male', female: 'Female', other: 'Other',
      Male: 'Male', Female: 'Female', Other: 'Other',
    };

    const updateData: Record<string, unknown> = {};
    if (updateProfileDto.name)      updateData.name      = updateProfileDto.name;
    if (updateProfileDto.email)     updateData.email     = updateProfileDto.email;
    if (updateProfileDto.phone)     updateData.phone     = updateProfileDto.phone;
    if (updateProfileDto.phoneCode) updateData.phoneCode = updateProfileDto.phoneCode;
    if (updateProfileDto.gender)    updateData.gender    = genderMap[updateProfileDto.gender] ?? updateProfileDto.gender;
    if (updateProfileDto.password)  updateData.password  = await bcrypt.hash(updateProfileDto.password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        gender: true,
        photo: true,
        userType: true,
        refCompanyId: true,
        updatedAt: true,
      },
    });

    return { message: 'Profile updated successfully', user: updatedUser };
  }

  async updateProfilePhoto(userId: number, photo: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, photo: true, isDeleted: true },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    // Delegate validation, old-file cleanup, and write to the storage abstraction.
    // Swap LocalStorageService → S3StorageService in app.module.ts to change backend.
    if (user.photo) await this.storage.delete(user.photo);

    const { url } = await this.storage.upload(photo, 'profile-photos');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { photo: url },
      select: { id: true, name: true, email: true, phone: true, photo: true, updatedAt: true },
    });

    return { message: 'Profile photo updated successfully', user: updatedUser };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, isDeleted: true },
    });

    if (!existingUser || existingUser.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const { roleId, password, ...userData } = updateUserDto;

    const updateData: any = { ...userData };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    return this.prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          phoneCode: true,
          userType: true,
          refCompanyId: true,
          gender: true,
          isActive: true,
          updatedAt: true,
        },
      });

      // Update role if provided
      if (roleId) {
        await tx.userRole.deleteMany({ where: { refUserId: id } });
        await tx.userRole.create({
          data: {
            refUserId: id,
            refRoleId: roleId,
          },
        });
      }

      return { message: 'User updated successfully', user };
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, isDeleted: true, photo: true },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    if (user.photo) await this.storage.delete(user.photo);

    await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });

    return { message: 'User deleted successfully' };
  }

  async getUserById(id: number) {
    // Get Own Profile for 
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        gender: true,
        photo: true,
        userType: true,
        refCompanyId: true,
        isActive: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                roleName: true,
                roleType: true,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}