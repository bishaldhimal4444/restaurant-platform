import { Body, Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TableSessionsService } from '../table-sessions/table-sessions.service';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';
import { GuestAuthGuard } from '../guest-auth/guest-auth.guard';
import type { Request } from 'express';

@Controller('guest/table-sessions')
@UseGuards(GuestAuthGuard)
export class GuestOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly tableSessionsService: TableSessionsService,
  ) {}

  @Post(':sessionId/orders')
  async create(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateGuestOrderDto,
    @Req() req: Request,
  ) {
    const guestToken = (req as any).guestToken as string;

    const session = await this.tableSessionsService.findOneRaw(sessionId);
    this.tableSessionsService.assertGuestOwnsSession(session, guestToken);

    return this.ordersService.create({ ...dto, tableSessionId: sessionId });
  }
}
