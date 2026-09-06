import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  private validateDiscountPrice(price: number, discountPrice?: number | null) {
    if (discountPrice !== undefined && discountPrice !== null && discountPrice >= price) {
      throw new BadRequestException('Discount price must be lower than the regular price');
    }
  }

  async create(dto: CreateMenuItemDto) {
    const restaurantId = await this.getRestaurantId();
    this.validateDiscountPrice(dto.price, dto.discountPrice);
    const item = await this.prisma.menuItem.create({
      data: { ...dto, restaurantId },
      include: { category: true, _count: { select: { orderItems: true } } },
    });
    return serializeDecimals(item);
  }

  async findAll() {
    const restaurantId = await this.getRestaurantId();
    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: { category: true, _count: { select: { orderItems: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return serializeDecimals(items);
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true, _count: { select: { orderItems: true } } },
    });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return serializeDecimals(item);
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const existing = await this.findOne(id);
    const price = dto.price ?? existing.price;
    this.validateDiscountPrice(price, dto.discountPrice);
    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: dto,
      include: { category: true, _count: { select: { orderItems: true } } },
    });
    return serializeDecimals(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.menuItem.delete({ where: { id } });
    return { deleted: true };
  }

  /** Persists the drag/reorder order of the "Featured Items" strip. */
  async reorderFeatured(orderedIds: string[]) {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.menuItem.update({
          where: { id },
          data: { featuredOrder: index },
        }),
      ),
    );
    return { reordered: orderedIds.length };
  }
}
