import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompaniesService } from '../companies/companies.service';
import { CacheService } from '../cache/cache.service';
import { TransactionType } from '@prisma/client';

const DASHBOARD_CACHE_TTL = 600; // 10 minutes

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private companiesService: CompaniesService,
    private cache: CacheService,
  ) {}

  async getDashboard(companyId: string, userId: string) {
    await this.companiesService.ensureAccess(userId, companyId);

    const cacheKey = `dashboard:company:${companyId}`;
    const cached = await this.cache.get<Awaited<ReturnType<ReportsService['computeDashboard']>>>(cacheKey);
    if (cached) return cached;

    const result = await this.computeDashboard(companyId);
    await this.cache.set(cacheKey, result, DASHBOARD_CACHE_TTL);
    return result;
  }

  async getDashboardFull(companyId: string, userId: string) {
    await this.companiesService.ensureAccess(userId, companyId);

    const cacheKey = `dashboard-full:company:${companyId}`;
    const cached = await this.cache.get<{ dashboard: Awaited<ReturnType<ReportsService['computeDashboard']>>; monthly: Awaited<ReturnType<ReportsService['computeMonthlyIncome']>> }>(cacheKey);
    if (cached) return cached;

    const [dashboard, monthly] = await Promise.all([
      this.computeDashboard(companyId),
      this.computeMonthlyIncome(companyId),
    ]);
    const result = { dashboard, monthly };
    await this.cache.set(cacheKey, result, DASHBOARD_CACHE_TTL);
    return result;
  }

  private async computeDashboard(companyId: string) {

    const branches = await this.prisma.branch.findMany({
      where: { companyId },
      include: {
        transactions: true,
        partners: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const branchProfits: { branchId: string; branchName: string; profit: number }[] = [];
    const partnerProfits = new Map<string, { userId: string; userName: string; profit: number }>();

    for (const branch of branches) {
      let branchIncome = 0;
      let branchExpense = 0;
      for (const tx of branch.transactions) {
        const amount = Number(tx.amount);
        if (tx.type === TransactionType.GELIR) {
          branchIncome += amount;
          totalIncome += amount;
        } else {
          branchExpense += amount;
          totalExpense += amount;
        }
      }
      const branchProfit = branchIncome - branchExpense;
      branchProfits.push({
        branchId: branch.id,
        branchName: branch.name,
        profit: branchProfit,
      });

      for (const partner of branch.partners) {
        const share = branchProfit * (Number(partner.percentage) / 100);
        const key = partner.userId;
        if (!partnerProfits.has(key)) {
          partnerProfits.set(key, {
            userId: partner.userId,
            userName: partner.user.name,
            profit: 0,
          });
        }
        const p = partnerProfits.get(key)!;
        p.profit += share;
      }
    }

    const netProfit = totalIncome - totalExpense;

    return {
      summary: {
        totalIncome,
        totalExpense,
        netProfit,
        cashInHand: netProfit,
      },
      profitByBranch: branchProfits,
      profitByPartner: Array.from(partnerProfits.values()),
    };
  }

  async getMonthlyIncome(companyId: string, userId: string, year?: number) {
    await this.companiesService.ensureAccess(userId, companyId);
    const cacheKey = `monthly:company:${companyId}:${year || new Date().getFullYear()}`;
    const cached = await this.cache.get<Awaited<ReturnType<ReportsService['computeMonthlyIncome']>>>(cacheKey);
    if (cached) return cached;
    const result = await this.computeMonthlyIncome(companyId, year);
    await this.cache.set(cacheKey, result, DASHBOARD_CACHE_TTL);
    return result;
  }

  private async computeMonthlyIncome(companyId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const branches = await this.prisma.branch.findMany({
      where: { companyId },
      select: { id: true },
    });
    const branchIds = branches.map((b) => b.id);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        branchId: { in: branchIds },
        type: TransactionType.GELIR,
        date: {
          gte: new Date(targetYear, 0, 1),
          lt: new Date(targetYear + 1, 0, 1),
        },
      },
    });

    const monthly: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) monthly[m] = 0;
    for (const tx of transactions) {
      const m = new Date(tx.date).getMonth() + 1;
      monthly[m] = (monthly[m] || 0) + Number(tx.amount);
    }

    return {
      year: targetYear,
      monthly: Object.entries(monthly).map(([month, amount]) => ({
        month: parseInt(month, 10),
        amount,
      })),
    };
  }

  async getProfitByBranch(companyId: string, userId: string) {
    const dashboard = await this.getDashboard(companyId, userId);
    return dashboard.profitByBranch;
  }

  async getProfitByPartner(companyId: string, userId: string) {
    const dashboard = await this.getDashboard(companyId, userId);
    return dashboard.profitByPartner;
  }
}
