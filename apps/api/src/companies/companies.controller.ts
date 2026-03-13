import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  async findAll(@CurrentUser() user: { userId: string }) {
    return this.companiesService.findUserCompanies(user.userId);
  }

  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() body: { name: string },
  ) {
    return this.companiesService.create(user.userId, body.name);
  }

  @Get(':id/accounts')
  @UseGuards(TenantGuard)
  async listAccounts(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.companiesService.listAccounts(id, user.userId);
  }

  @Post(':id/accounts')
  @UseGuards(TenantGuard)
  async createAccount(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name: string; type: string },
  ) {
    return this.companiesService.createAccount(id, user.userId, {
      name: body.name,
      type: body.type as import('@prisma/client').AccountType,
    });
  }

  @Delete(':id/accounts/:accountId')
  @UseGuards(TenantGuard)
  async deleteAccount(
    @Param('id') id: string,
    @Param('accountId') accountId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.companiesService.deleteAccount(id, accountId, user.userId);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.companiesService.findOne(id, user.userId);
  }

  @Post(':id/members')
  @UseGuards(TenantGuard)
  async addMember(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { email: string; role?: string },
  ) {
    const role = (body.role as Role) || Role.KULLANICI;
    return this.companiesService.addMember(id, user.userId, body.email, role);
  }

  @Delete(':id/members/:userId')
  @UseGuards(TenantGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.companiesService.removeMember(id, user.userId, userId);
  }

  @Patch(':id')
  @UseGuards(TenantGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name?: string },
  ) {
    return this.companiesService.update(id, user.userId, body);
  }
}
