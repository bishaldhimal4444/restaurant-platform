import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { BillsService } from './bills.service';
import { TableSessionsService } from '../table-sessions/table-sessions.service';
import { GuestAuthGuard } from '../guest-auth/guest-auth.guard';
import type { Request } from 'express';

@Controller('guest')
@UseGuards(GuestAuthGuard)
export class GuestBillsController {
  constructor(
    private readonly billsService: BillsService,
    private readonly tableSessionsService: TableSessionsService,
  ) {}

  @Post('table-sessions/:sessionId/bill')
  async generate(@Param('sessionId') sessionId: string, @Req() req: Request) {
    const guestToken = (req as any).guestToken as string;
    const session = await this.tableSessionsService.findOneRaw(sessionId);
    this.tableSessionsService.assertGuestOwnsSession(session, guestToken);
    return this.billsService.generate(sessionId);
  }

  @Get('bills/:billId')
  async getBill(@Param('billId') billId: string, @Req() req: Request) {
    const guestToken = (req as any).guestToken as string;
    const raw = await this.billsService.findOneRaw(billId);
    this.tableSessionsService.assertGuestOwnsSession(raw.tableSession, guestToken);
    return this.billsService.findOne(billId);
  }
}
