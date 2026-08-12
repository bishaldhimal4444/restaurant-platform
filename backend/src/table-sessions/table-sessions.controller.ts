import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { TableSessionsService } from './table-sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
export class TableSessionsController {
  constructor(private readonly tableSessionsService: TableSessionsService) {}

  @Get('table-sessions/pending')
  findPending() {
    return this.tableSessionsService.findPending();
  }

  @Get('tables/:tableId/active-session')
  findActiveForTable(@Param('tableId') tableId: string) {
    return this.tableSessionsService.findActiveForTable(tableId);
  }

  @Get('table-sessions/:id')
  findOne(@Param('id') id: string) {
    return this.tableSessionsService.findOne(id);
  }

  @Post('table-sessions/:id/confirm')
  confirm(@Param('id') id: string) {
    return this.tableSessionsService.confirm(id);
  }

  @Post('table-sessions/:id/reject')
  reject(@Param('id') id: string) {
    return this.tableSessionsService.reject(id);
  }

  @Post('table-sessions/:id/close')
  close(@Param('id') id: string) {
    return this.tableSessionsService.close(id);
  }
}
