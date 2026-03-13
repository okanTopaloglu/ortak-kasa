import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(
    email: string,
    password: string,
    name: string,
    companyName?: string,
  ) {
    const user = await this.usersService.create(email, password, name);
    if (companyName) {
      await this.usersService.addUserToCompany(user.id, companyName, Role.ADMIN);
    }
    const { password: _, ...userWithoutPassword } = user;
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async getProfile(userId: string) {
    return this.usersService.getProfile(userId);
  }
}
