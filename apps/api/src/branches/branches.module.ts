import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesByIdController } from './branches-id.controller';
import { BranchesService } from './branches.service';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { TenantGuard } from '../common/guards/tenant.guard';

@Module({
  imports: [UsersModule, CompaniesModule],
  controllers: [BranchesController, BranchesByIdController],
  providers: [BranchesService, TenantGuard],
  exports: [BranchesService],
})
export class BranchesModule {}
