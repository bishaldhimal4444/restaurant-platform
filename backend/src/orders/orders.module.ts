import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { GuestOrdersController } from './guest-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GuestAuthModule } from '../guest-auth/guest-auth.module';
import { TableSessionsModule } from '../table-sessions/table-sessions.module';

@Module({
  imports: [PrismaModule, GuestAuthModule, TableSessionsModule],
  controllers: [OrdersController, GuestOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
