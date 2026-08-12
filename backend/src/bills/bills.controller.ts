import { Body, Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { BillsService } from './bills.service';
import { PayBillDto } from './dto/pay-bill.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post('table-sessions/:tableSessionId/bill')
  generate(@Param('tableSessionId') tableSessionId: string) {
    return this.billsService.generate(tableSessionId);
  }

  @Get('bills/:id')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(id);
  }

  @Patch('bills/:id/pay')
  pay(@Param('id') id: string, @Body() dto: PayBillDto) {
    return this.billsService.pay(id, dto);
  }
}
