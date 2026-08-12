import { Module } from '@nestjs/common';
import { TableSessionsService } from './table-sessions.service';
import { TableSessionsController } from './table-sessions.controller';
import { GuestTableSessionsController } from './guest-table-sessions.controller';
import { TableSessionsCleanupTask } from './table-sessions-cleanup.task';
import { PrismaModule } from '../prisma/prisma.module';
import { GuestAuthModule } from '../guest-auth/guest-auth.module';

@Module({
  imports: [PrismaModule, GuestAuthModule],
  controllers: [TableSessionsController, GuestTableSessionsController],
  providers: [TableSessionsService, TableSessionsCleanupTask],
  exports: [TableSessionsService],
})
export class TableSessionsModule {}
