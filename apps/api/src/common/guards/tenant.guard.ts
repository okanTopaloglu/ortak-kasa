import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.userId) return false;

    const companyId =
      request.params.companyId || request.params.id || request.headers['x-company-id'];
    if (!companyId) {
      throw new BadRequestException('Şirket ID gerekli');
    }

    const hasAccess = await this.usersService.hasAccessToCompany(
      user.userId,
      companyId,
    );
    if (!hasAccess) return false;

    request.companyId = companyId;
    return true;
  }
}
