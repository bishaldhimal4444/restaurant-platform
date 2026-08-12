import { Body, Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { TableSessionsService } from './table-sessions.service';
import { CreateTableSessionDto } from './dto/create-table-session.dto';
import { GuestAuthGuard } from '../guest-auth/guest-auth.guard';
import type { Request } from 'express';

@Controller('guest/tables')
@UseGuards(GuestAuthGuard)
export class GuestTableSessionsController {
  constructor(private readonly tableSessionsService: TableSessionsService) {}

  @Post(':tableId/sessions')
  open(
    @Param('tableId') tableId: string,
    @Body() dto: CreateTableSessionDto,
    @Req() req: Request,
  ) {
    const guestToken = (req as any).guestToken as string;
    return this.tableSessionsService.open(tableId, dto, guestToken);
  }
}
