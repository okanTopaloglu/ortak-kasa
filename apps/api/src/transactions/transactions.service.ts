import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BranchesService } from '../branches/branches.service';
import { CacheService } from '../cache/cache.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private branchesService: BranchesService,
    private cache: CacheService,
  ) {}

  private async invalidateCompanyCache(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { companyId: true },
    });
    if (branch) {
      await this.cache.del(`dashboard:company:${branch.companyId}`);
      await this.cache.del(`dashboard-full:company:${branch.companyId}`);
      const year = new Date().getFullYear();
      await this.cache.del(`monthly:company:${branch.companyId}:${year}`);
    }
  }

  async findAll(branchId: string, userId: string) {
    await this.branchesService.ensureBranchAccess(userId, branchId);
    return this.prisma.transaction.findMany({
      where: { branchId },
      include: { account: { select: { id: true, name: true, type: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(transactionId: string, userId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { branch: true },
    });
    if (!tx) throw new NotFoundException('İşlem bulunamadı');
    await this.branchesService.ensureBranchAccess(userId, tx.branchId);
    return tx;
  }

  async create(
    branchId: string,
    userId: string,
    data: {
      amount: number;
      description?: string;
      date: string;
      type: TransactionType;
      accountId?: string | null;
    },
  ) {
    await this.branchesService.ensureBranchAccess(userId, branchId);
    if (!data.amount || data.amount <= 0) {
      throw new BadRequestException('Tutar 0\'dan büyük olmalıdır');
    }
    const tx = await this.prisma.transaction.create({
      data: {
        branchId,
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        type: data.type,
        ...(data.accountId && { accountId: data.accountId }),
      },
    });
    await this.invalidateCompanyCache(branchId);
    return tx;
  }

  async update(
    transactionId: string,
    userId: string,
    data: {
      amount?: number;
      description?: string;
      date?: string;
      type?: TransactionType;
      accountId?: string | null;
    },
  ) {
    const tx = await this.findOne(transactionId, userId);
    const updated = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.accountId !== undefined && { accountId: data.accountId || null }),
      },
    });
    await this.invalidateCompanyCache(tx.branchId);
    return updated;
  }

  async delete(transactionId: string, userId: string) {
    const tx = await this.findOne(transactionId, userId);
    const deleted = await this.prisma.transaction.delete({
      where: { id: transactionId },
    });
    await this.invalidateCompanyCache(tx.branchId);
    return deleted;
  }
}
