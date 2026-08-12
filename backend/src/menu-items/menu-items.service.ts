import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { serializeDecimals } from '../common/serialize';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getRestaurantId() {
    const restaurant = await this.prisma.restaurant.findFirst();
    if (!restaurant) {
      throw new NotFoundException('No restaurant has been set up yet');
    }
    return restaurant.id;
  }

  async create(dto: CreateMenuItemDto) {
    const restaurantId = await this.getRestaurantId();
    const item = await this.prisma.menuItem.create({
      data: { ...dto, restaurantId },
    });
    return serializeDecimals(item);
  }

  async findAll() {
    const restaurantId = await this.getRestaurantId();
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

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findOne(id);
    const updated = await this.prisma.menuItem.update({ where: { id }, data: dto });
    return serializeDecimals(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.menuItem.delete({ where: { id } });
    return { deleted: true };
  }
}
