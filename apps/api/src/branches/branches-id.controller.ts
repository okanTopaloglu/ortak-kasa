import { Body, Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesByIdController {
  constructor(private branchesService: BranchesService) {}

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name: string },
  ) {
    return this.branchesService.update(id, user.userId, body.name);
  }
}
