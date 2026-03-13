import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompaniesService } from '../companies/companies.service';
import { Role } from '@prisma/client';

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private companiesService: CompaniesService,
  ) {}

  async findAll(companyId: string, userId: string) {
    await this.companiesService.ensureAccess(userId, companyId);
    return this.prisma.branch.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(branchId: string, userId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { company: true },
    });
    if (!branch) throw new NotFoundException('İş kolu bulunamadı');
    await this.companiesService.ensureAccess(userId, branch.companyId);
    return branch;
  }

  async create(companyId: string, userId: string, name: string) {
    await this.companiesService.ensureAccess(userId, companyId, Role.ORTAK);
    return this.prisma.branch.create({
      data: { companyId, name },
    });
  }

  async update(branchId: string, userId: string, name: string) {
    const branch = await this.findOne(branchId, userId);
    await this.companiesService.ensureAccess(userId, branch.companyId, Role.ADMIN);
    return this.prisma.branch.update({
      where: { id: branchId },
      data: { name },
    });
  }

  async ensureBranchAccess(userId: string, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw new NotFoundException('İş kolu bulunamadı');
    await this.companiesService.ensureAccess(userId, branch.companyId);
    return branch;
  }
}
