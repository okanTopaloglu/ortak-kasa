import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userCompanies: {
          include: { company: true },
        },
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  async create(email: string, password: string, name: string) {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        userCompanies: {
          include: {
            company: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  async addUserToCompany(userId: string, companyName: string, role: Role) {
    const slug = this.createSlug(companyName);
    const existingCompany = await this.prisma.company.findUnique({
      where: { slug },
    });
    let company;
    if (existingCompany) {
      company = existingCompany;
    } else {
      company = await this.prisma.company.create({
        data: { name: companyName, slug },
      });
    }
    await this.prisma.userCompany.upsert({
      where: {
        userId_companyId: { userId, companyId: company.id },
      },
      create: { userId, companyId: company.id, role },
      update: { role },
    });
    return company;
  }

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now();
  }

  async hasAccessToCompany(userId: string, companyId: string): Promise<boolean> {
    const uc = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
    });
    return !!uc;
  }

  async getCompanyRole(userId: string, companyId: string): Promise<Role | null> {
    const uc = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
    });
    return uc?.role ?? null;
  }
}
