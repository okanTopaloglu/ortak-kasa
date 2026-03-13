import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('companies/:companyId')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard-full')
  async getDashboardFull(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reportsService.getDashboardFull(companyId, user.userId);
  }

  @Get('dashboard')
  async getDashboard(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reportsService.getDashboard(companyId, user.userId);
  }

  @Get('reports/monthly-income')
  async getMonthlyIncome(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { userId: string },
    @Query('year') year?: string,
  ) {
    return this.reportsService.getMonthlyIncome(
      companyId,
      user.userId,
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Get('reports/profit-by-branch')
  async getProfitByBranch(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reportsService.getProfitByBranch(companyId, user.userId);
  }

  @Get('reports/profit-by-partner')
  async getProfitByPartner(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reportsService.getProfitByPartner(companyId, user.userId);
  }
}
