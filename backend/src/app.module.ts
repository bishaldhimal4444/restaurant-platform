import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TablesModule } from './tables/tables.module';
import { TableSessionsModule } from './table-sessions/table-sessions.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { OrdersModule } from './orders/orders.module';
import { BillsModule } from './bills/bills.module';
import { GuestAuthModule } from './guest-auth/guest-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    RestaurantsModule,
    TablesModule,
    TableSessionsModule,
    MenuItemsModule,
    OrdersModule,
    BillsModule,
    GuestAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
