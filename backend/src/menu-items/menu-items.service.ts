import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { serializeDecimals } from '../common/serialize';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(restaurantId: string, userId: string, dto: CreateMenuItemDto) {
    await this.assertOwnership(restaurantId, userId);
    const item = await this.prisma.menuItem.create({
      data: { ...dto, restaurantId },
    });
    return serializeDecimals(item);
  }

  async findAllForRestaurant(restaurantId: string) {
    const items = await this.prisma.menuItem.findMany({ where: { restaurantId } });
    return serializeDecimals(items);
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return serializeDecimals(item);
  }

  async update(id: string, userId: string, dto: UpdateMenuItemDto) {
    const item = await this.findOneRaw(id);
    await this.assertOwnership(item.restaurantId, userId);
    const updated = await this.prisma.menuItem.update({ where: { id }, data: dto });
    return serializeDecimals(updated);
  }

  async remove(id: string, userId: string) {
    const item = await this.findOneRaw(id);
    await this.assertOwnership(item.restaurantId, userId);
    await this.prisma.menuItem.delete({ where: { id } });
    return { deleted: true };
  }

  private async findOneRaw(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return item;
  }

  private async assertOwnership(restaurantId: string, userId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }
    return restaurant;
  }
}
