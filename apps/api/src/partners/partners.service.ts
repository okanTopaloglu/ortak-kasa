import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BranchesService } from '../branches/branches.service';
import { CompaniesService } from '../companies/companies.service';
import { Role } from '@prisma/client';
interface PartnerInput {
  userId: string;
  percentage: number;
}

@Injectable()
export class PartnersService {
  constructor(
    private prisma: PrismaService,
    private branchesService: BranchesService,
    private companiesService: CompaniesService,
  ) {}

  async getPartners(branchId: string, userId: string) {
    await this.branchesService.ensureBranchAccess(userId, branchId);
    return this.prisma.branchPartner.findMany({
      where: { branchId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async setPartners(
    branchId: string,
    userId: string,
    partners: PartnerInput[],
  ) {
    const branch = await this.branchesService.findOne(branchId, userId);
    await this.companiesService.ensureAccess(userId, branch.companyId, Role.ORTAK);

    const total = partners.reduce((sum, p) => sum + p.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new BadRequestException('Ortak yüzdeleri toplamı 100 olmalıdır');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.branchPartner.deleteMany({ where: { branchId } });
      if (partners.length > 0) {
        await tx.branchPartner.createMany({
          data: partners.map((p) => ({
            branchId,
            userId: p.userId,
            percentage: p.percentage,
          })),
        });
      }
    });

    return this.getPartners(branchId, userId);
  }
}
