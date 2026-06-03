import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import * as bcrypt from 'bcrypt';
import { NotificationService } from '../notification/notification.service';
import { GenderCategory, NotificationCategory } from '../../../generated/prisma/enums';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  private readonly companyInclude = {
    state: true,
    country: true,
    industry: true,
    owner: { select: { id: true, name: true, email: true, phoneCode: true, phone: true, gender: true, photo: true, refCompanyId: true } },
  };

  private readonly fullCompanyInclude = {
    ...this.companyInclude,
    rds: true,
  };

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }


  private async resolveDefaultIndustryId(
    refIndustryId?: number,
  ): Promise<number> {
    if (refIndustryId) return refIndustryId;
    const first = await this.prisma.industry.findFirst();
    if (first) return first.id;
    const created = await this.prisma.industry.create({
      data: { industryName: 'General' },
    });
    return created.id;
  }

  async create(dto: RegisterClientDto) {
    this.logger.log(
      `Registering new client: ${dto.companyName} (${dto.companyEmail})`,
    );

    const {
      // Company
      companyName,
      companyEmail,
      companyPhone,
      companyPhoneCode,
      address,
      pinCode,
      cityName,
      refStateId,
      refCountryId,
      refIndustryId,
      gstNumber,
      panNumber,

      // User
      name,
      email,
      password,
      phone,
      phoneCode,
      gender,
    } = dto;

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (tx) => {
      /**
       * 1. Check Existing User
       */
      const userExists = await tx.user.findFirst({
        where: {
          OR: [
            { email },
            ...(phone ? [{ phone }] : []),
          ],
          isDeleted: false,
        },

        select: {
          id: true,
          email: true,
          phone: true,
        },
      });

      if (userExists) {
        if (userExists.email === email) {
          throw new BadRequestException('User email already exists');
        }

        if (userExists.phone === phone) {
          throw new BadRequestException('User phone already exists');
        }
      }

      /**
       * 2. Check Existing Company
       */
      const companyExists = await tx.company.findFirst({
        where: {
          email: companyEmail,
          isDeleted: false,
        },

        select: {
          id: true,
        },
      });

      if (companyExists) {
        throw new BadRequestException('Company email already exists');
      }

      /**
       * 3. Find/Create Role
       */
      let role = await tx.role.findUnique({
        where: {
          roleName: 'Client Administrator',
        },
      });

      if (!role) {
        role = await tx.role.create({
          data: {
            roleName: 'Client Administrator',
            roleType: 'CLIENT_ROLE',
            description: 'Client company administrator',
          },
        });
      }

      /**
       * 4. Resolve Data
       */

      const resolvedIndustryId =
        await this.resolveDefaultIndustryId(refIndustryId);

      /**
       * 5. Create Company First
       */
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: companyPhone || "",
          address,
          pinCode,
          cityName,
          refIndustryId: resolvedIndustryId,
          refStateId,
          refCountryId,
          phoneCode: companyPhoneCode,
          gstNumber,
          panNumber,
        },

        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      /**
       * 6. Create User With Company Reference
       */
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          phoneCode,
          gender,
          userType: 'CLIENT_ADMIN',

          company: {
            connect: {
              id: company.id,
            },
          },
        },

        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      /**
       * 7. Update Company Owner
       */
      await tx.company.update({
        where: {
          id: company.id,
        },

        data: {
          owner: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      /**
       * 8. Assign Role
       */
      await tx.userRole.create({
        data: {
          refUserId: user.id,
          refRoleId: role.id,
        },
      });

      /**
       * 9. Notification
       */
      await this.notificationService.create({
        category: NotificationCategory.CLIENT,
        title: 'New Client Registered',
        message: `A new company "${companyName}" has been registered by ${name}.`,
        recipientUserIds: [],
        referenceType: 'Company',
        referenceId: company.id,
        actionUrl: `/admin/clients`,
      });

      return { message: 'Client registered successfully', company, user };
    });
  }

  async update(
    id: number,
    dto: {
      companyName?: string; companyEmail?: string; companyPhone?: string; companyPhoneCode?: string;
      address?: string; pinCode?: string; cityName?: string; refStateId?: number; refCountryId?: number;
      refIndustryId?: number; gstNumber?: string; panNumber?: string;
      userId: number; name?: string; email?: string; phone?: string; phoneCode?: string; gender?: string;
    },
  ) {
    const {
      companyName, companyEmail, companyPhone, companyPhoneCode,
      address, pinCode, cityName, refStateId, refCountryId,
      refIndustryId, gstNumber, panNumber,
      userId, name, email, phone, phoneCode, gender,
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({
        where: { id },
        include: { owner: true },
      });
      if (!company) throw new BadRequestException('Company not found');

      const userData: {
        name?: string; email?: string; phone?: string;
        gender?: GenderCategory; phoneCode?: string;
      } = { name, email, phone, phoneCode, gender: gender as GenderCategory | undefined };

      await tx.user.update({
        where: { id: userId },
        data: userData,
      });

      // Update Compan
      return tx.company.update({
        where: { id },
        data: {
          name: companyName,
          email: companyEmail,
          address: address,
          pinCode: pinCode,
          phoneCode: companyPhoneCode,
          phone: companyPhone,
          cityName,
          refIndustryId,
          refStateId,
          refCountryId,
          gstNumber,
          panNumber
        },
      });
    });
  }



  async findAll() {
    return this.prisma.company.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        phone: true,
        cityName: true,
        isActive: true,
        industry: { select: { industryName: true } },
        owner: {
          select: {
            name: true,
            email: true,
            phoneCode: true,
            phone: true,
            photo: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.company.findUnique({
      where: { id },
      include: this.fullCompanyInclude,
    });
  }


  async updateStatus(id: number, isActive: boolean) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!company) throw new BadRequestException('Company not found');

    await this.prisma.company.update({
      where: { id },
      data: { isActive },
    });

    const ownerId = Number(company.refOwnerUserId);
    if (ownerId) {
      await this.prisma.user.update({
        where: { id: ownerId },
        data: { isActive },
      });

      await this.notificationService.create({
        category: NotificationCategory.SYSTEM,
        title: 'Account Status Updated',
        message: `Your account status has been ${isActive ? 'activated' : 'deactivated'} by an administrator.`,
        recipientUserIds: [ownerId],
        referenceType: 'Company',
        referenceId: id,
        actionUrl: `/`,
      });
    }

    return { message: `Company ${isActive ? 'activated' : 'deactivated'} successfully` };
  }

  async remove(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Check if company has any related data
    const rdsCount = await this.prisma.rDInfo.count({
      where: { refCompanyId: id },
    });

    if (rdsCount > 0) {
      throw new BadRequestException(
        `Cannot delete company. It has ${rdsCount} RD(s) associated with it. Please delete them first.`,
      );
    }

    const pickupsCount = await this.prisma.pickup.count({
      where: { refCompanyId: id },
    });

    if (pickupsCount > 0) {
      throw new BadRequestException(
        `Cannot delete company. It has ${pickupsCount} pickup(s) associated with it.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete user roles first
      await tx.userRole.deleteMany({
        where: { refUserId: Number(company.refOwnerUserId) },
      });

      // Delete the owner user
      await tx.user.delete({
        where: { id: Number(company.refOwnerUserId) },
      });

      // Delete the company
      return tx.company.delete({
        where: { id },
      });
    });
  }


  async uploadCompanyDocument(
    id: number,
    files: {
      panDocument?: Express.Multer.File[];
      gstDocument?: Express.Multer.File[];
      logo?: Express.Multer.File[];
    },
  ) {
    const updateData: { panDocument?: string; gstDocument?: string; logo?: string } = {};

    if (files?.panDocument?.[0]) updateData.panDocument = files.panDocument[0].path;
    if (files?.gstDocument?.[0]) updateData.gstDocument = files.gstDocument[0].path;
    if (files?.logo?.[0])        updateData.logo         = files.logo[0].path;

    await this.prisma.company.update({ where: { id }, data: updateData });

    return { message: 'Documents uploaded successfully' };
  }
}
