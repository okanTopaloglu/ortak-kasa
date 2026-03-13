import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { UsersModule } from '../users/users.module';
import { TenantGuard } from '../common/guards/tenant.guard';

@Module({
  imports: [UsersModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, TenantGuard],
  exports: [CompaniesService],
})
export class CompaniesModule {}
