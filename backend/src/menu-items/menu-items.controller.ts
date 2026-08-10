import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthedRequest {
  user: { userId: string; email: string; role: string };
}

@Controller('restaurants/:restaurantId/menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('restaurantId') restaurantId: string,
    @Request() req: AuthedRequest,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menuItemsService.create(restaurantId, req.user.userId, dto);
  }

  @Get()
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.menuItemsService.findAllForRestaurant(restaurantId);
  }
}

@Controller('menu-items')
export class MenuItemDetailController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: AuthedRequest,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.menuItemsService.remove(id, req.user.userId);
  }
}
