import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransactionType } from '@prisma/client';

@Controller('branches/:branchId/transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  async findAll(
    @Param('branchId') branchId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.transactionsService.findAll(branchId, user.userId);
  }

  @Post()
  async create(
    @Param('branchId') branchId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { amount: number; description?: string; date: string; type: TransactionType; accountId?: string },
  ) {
    return this.transactionsService.create(branchId, user.userId, body);
  }

  @Get(':transactionId')
  async findOne(
    @Param('branchId') branchId: string,
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.transactionsService.findOne(transactionId, user.userId);
  }

  @Patch(':transactionId')
  async update(
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { amount?: number; description?: string; date?: string; type?: TransactionType; accountId?: string | null },
  ) {
    return this.transactionsService.update(transactionId, user.userId, body);
  }

  @Delete(':transactionId')
  async delete(
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.transactionsService.delete(transactionId, user.userId);
  }
}
