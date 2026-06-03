import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) throw new BadRequestException('User with this email already exists');

    if (
      (registerDto.userType === 'CLIENT_ADMIN' || registerDto.userType === 'CLIENT_USER') &&
      !registerDto.refCompanyId
    ) {
      throw new BadRequestException('Client users must be associated with a company');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.phone,
        gender: registerDto.gender,
        password: hashedPassword,
        userType: registerDto.userType,
        refCompanyId: registerDto.refCompanyId,
      },
      select: { id: true, name: true, email: true, userType: true, refCompanyId: true, createdAt: true },
    });

    return { message: 'User registered successfully', user };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        company: { select: { id: true, name: true } },
        userRoles: { include: { role: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive || user.isDeleted) throw new UnauthorizedException('User account is inactive');

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.generateTokenPair(user.id, user.email, user.userType);

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        refCompanyId: user.refCompanyId,
        company: user.company,
      },
    };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, email: true, userType: true, isActive: true, isDeleted: true } } },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!stored.user.isActive || stored.user.isDeleted) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Rotate: revoke the used token and issue a new pair (prevents reuse attacks)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokenPair(stored.user.id, stored.user.email, stored.user.userType);

    return { message: 'Token refreshed', accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
    return { message: 'Logout successful' };
  }

  async resetPassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return { message: 'Password updated successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true, gender: true,
        photo: true, userType: true, refCompanyId: true, isActive: true, createdAt: true,
        company: { select: { id: true, name: true, email: true } },
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private async generateTokenPair(userId: number, email: string, userType: string) {
    const payload = { sub: userId, email, userType };
    const accessToken = this.jwtService.sign(payload); // 15 min (set in module)

    const rawToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.refreshToken.create({
      data: { token: rawToken, refUserId: userId, expiresAt },
    });

    return { accessToken, refreshToken: rawToken };
  }
}
