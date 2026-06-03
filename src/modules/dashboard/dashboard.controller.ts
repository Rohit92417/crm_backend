import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('admin')
  async getAdminStats() {
    return this.service.getAdminStats();
  }

  @Get('client')
  async getClientStats(@Req() req) {
    const user = req.user; // Assuming JwtGuard attaches user to req
    return this.service.getClientStats(user.id, user.refCompanyId);
  }
}
