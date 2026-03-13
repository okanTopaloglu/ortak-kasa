import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('companies/:companyId/branches')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Get()
  async findAll(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.branchesService.findAll(companyId, user.userId);
  }

  @Post()
  async create(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name: string },
  ) {
    return this.branchesService.create(companyId, user.userId, body.name);
  }

  @Get(':branchId')
  async findOne(
    @Param('branchId') branchId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.branchesService.findOne(branchId, user.userId);
  }

  @Patch(':branchId')
  async update(
    @Param('branchId') branchId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name: string },
  ) {
    return this.branchesService.update(branchId, user.userId, body.name);
  }
}
