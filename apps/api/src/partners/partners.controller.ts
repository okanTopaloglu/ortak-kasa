import { Body, Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('branches/:branchId/partners')
@UseGuards(JwtAuthGuard)
export class PartnersController {
  constructor(private partnersService: PartnersService) {}

  @Get()
  async getPartners(
    @Param('branchId') branchId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.partnersService.getPartners(branchId, user.userId);
  }

  @Put()
  async setPartners(
    @Param('branchId') branchId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { partners: { userId: string; percentage: number }[] },
  ) {
    return this.partnersService.setPartners(branchId, user.userId, body.partners);
  }
}
