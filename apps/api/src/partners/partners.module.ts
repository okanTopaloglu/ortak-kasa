import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { BranchesModule } from '../branches/branches.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [BranchesModule, CompaniesModule],
  controllers: [PartnersController],
  providers: [PartnersService],
})
export class PartnersModule {}
