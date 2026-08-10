import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController, MenuItemDetailController } from './menu-items.controller';

@Module({
  providers: [MenuItemsService],
  controllers: [MenuItemsController, MenuItemDetailController],
})
export class MenuItemsModule {}
