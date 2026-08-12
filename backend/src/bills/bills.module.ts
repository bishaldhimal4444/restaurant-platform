import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { GuestBillsController } from './guest-bills.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GuestAuthModule } from '../guest-auth/guest-auth.module';
import { TableSessionsModule } from '../table-sessions/table-sessions.module';

@Module({
  imports: [PrismaModule, GuestAuthModule, TableSessionsModule],
  controllers: [BillsController, GuestBillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
