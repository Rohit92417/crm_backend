import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    // Check if role with same name already exists
    const exists = await this.prisma.role.findFirst({
      where: { roleName: dto.roleName },
    });
    
    if (exists) {
      throw new BadRequestException('Role with this name already exists');
    }

    return this.prisma.role.create({ data: dto });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { roleName: 'asc' },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        modulePermissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    // Check if role exists
    await this.findOne(id);

    // If updating name, check for duplicates
    if (dto.roleName) {
      const exists = await this.prisma.role.findFirst({
        where: {
          roleName: dto.roleName,
          NOT: { id },
        },
      });

      if (exists) {
        throw new BadRequestException('Role with this name already exists');
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    // Check if role exists
    await this.findOne(id);

    // Check if role is being used by any user roles
    const userRolesCount = await this.prisma.userRole.count({
      where: { refRoleId: id },
    });

    if (userRolesCount > 0) {
      throw new BadRequestException(
        `Cannot delete role. It is assigned to ${userRolesCount} user(s)`
      );
    }

    // Delete associated module permissions first
    await this.prisma.modulePermission.deleteMany({
      where: { refRoleId: id },
    });

    // Delete the role
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
