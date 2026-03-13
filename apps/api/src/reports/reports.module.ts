import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CompaniesModule } from '../companies/companies.module';
import { UsersModule } from '../users/users.module';
import { TenantGuard } from '../common/guards/tenant.guard';

@Module({
  imports: [CompaniesModule, UsersModule],
  controllers: [ReportsController],
  providers: [ReportsService, TenantGuard],
})
export class ReportsModule {}
