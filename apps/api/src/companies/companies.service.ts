import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { Role, AccountType } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async findUserCompanies(userId: string) {
    return this.prisma.company.findMany({
      where: {
        userCompanies: {
          some: { userId },
        },
      },
      include: {
        userCompanies: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    await this.ensureAccess(userId, id);
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        branches: true,
        userCompanies: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!company) throw new NotFoundException('Şirket bulunamadı');
    return company;
  }

  async create(userId: string, name: string) {
    const slug = this.createSlug(name);
    const company = await this.prisma.company.create({
      data: {
        name,
        slug,
        userCompanies: {
          create: { userId, role: Role.ADMIN },
        },
      },
    });
    return company;
  }

  async update(id: string, userId: string, data: { name?: string }) {
    await this.ensureAccess(userId, id, Role.ADMIN);
    if (!data.name) return this.prisma.company.findUniqueOrThrow({ where: { id } });
    return this.prisma.company.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async addMember(companyId: string, adminUserId: string, email: string, role: Role = Role.KULLANICI) {
    await this.ensureAccess(adminUserId, companyId, Role.ADMIN);
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new NotFoundException('Bu email adresine kayıtlı kullanıcı bulunamadı');
    await this.prisma.userCompany.upsert({
      where: {
        userId_companyId: { userId: user.id, companyId },
      },
      create: { userId: user.id, companyId, role },
      update: { role },
    });
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true },
    });
  }

  async removeMember(companyId: string, adminUserId: string, userIdToRemove: string) {
    await this.ensureAccess(adminUserId, companyId, Role.ADMIN);
    if (adminUserId === userIdToRemove) {
      throw new ForbiddenException('Kendinizi şirketten çıkaramazsınız');
    }
    const adminCount = await this.prisma.userCompany.count({
      where: { companyId, role: Role.ADMIN },
    });
    const targetUser = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: userIdToRemove, companyId } },
    });
    if (!targetUser) throw new NotFoundException('Bu üye şirkette bulunamadı');
    if (targetUser.role === Role.ADMIN && adminCount <= 1) {
      throw new ForbiddenException('Son admin üye çıkarılamaz');
    }
    await this.prisma.userCompany.delete({
      where: { userId_companyId: { userId: userIdToRemove, companyId } },
    });
    return { success: true };
  }

  async listAccounts(companyId: string, userId: string) {
    await this.ensureAccess(userId, companyId);
    return this.prisma.account.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createAccount(
    companyId: string,
    userId: string,
    data: { name: string; type: AccountType },
  ) {
    await this.ensureAccess(userId, companyId, Role.ADMIN);
    return this.prisma.account.create({
      data: { companyId, name: data.name, type: data.type },
    });
  }

  async deleteAccount(
    companyId: string,
    accountId: string,
    userId: string,
  ) {
    await this.ensureAccess(userId, companyId, Role.ADMIN);
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, companyId },
    });
    if (!account) throw new NotFoundException('Hesap bulunamadı');
    await this.prisma.transaction.updateMany({
      where: { accountId },
      data: { accountId: null },
    });
    await this.prisma.account.delete({ where: { id: accountId } });
    return { success: true };
  }

  async ensureAccess(userId: string, companyId: string, requiredRole?: Role) {
    const hasAccess = await this.usersService.hasAccessToCompany(
      userId,
      companyId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Bu şirkete erişim yetkiniz yok');
    }
    if (requiredRole) {
      const role = await this.usersService.getCompanyRole(userId, companyId);
      const hierarchy = [Role.KULLANICI, Role.ORTAK, Role.ADMIN];
      if (
        !role ||
        hierarchy.indexOf(role) < hierarchy.indexOf(requiredRole)
      ) {
        throw new ForbiddenException('Bu işlem için yetkiniz yok');
      }
    }
  }

  private createSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now()
    );
  }
}
