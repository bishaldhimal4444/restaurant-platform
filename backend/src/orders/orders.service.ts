import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { serializeDecimals } from '../common/serialize';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, restaurantId: dto.restaurantId },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items are invalid for this restaurant');
    }

    const unavailable = menuItems.filter((m) => !m.isAvailable);
    if (unavailable.length > 0) {
      throw new BadRequestException(
        `Unavailable items: ${unavailable.map((m) => m.name).join(', ')}`,
      );
    }

    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    let totalAmount = 0;
    const orderItemsData = dto.items.map((input) => {
      const menuItem = menuItemMap.get(input.menuItemId)!;
      const unitPrice = Number(menuItem.price);
      totalAmount += unitPrice * input.quantity;
      return {
        menuItemId: input.menuItemId,
        quantity: input.quantity,
        unitPrice: menuItem.price,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        customerId,
        restaurantId: dto.restaurantId,
        totalAmount,
        items: { create: orderItemsData },
      },
      include: { items: { include: { menuItem: true } } },
    });

    return serializeDecimals(order);
  }

  async findMineAsCustomer(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return serializeDecimals(orders);
  }

  async findMineAsOwner(ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { ownerId } });
    if (!restaurant) {
      throw new NotFoundException('You do not own a restaurant');
    }
    const orders = await this.prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      include: { items: { include: { menuItem: true } }, customer: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return serializeDecimals(orders);
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const isCustomer = order.customerId === userId;
    const isOwner = order.restaurant.ownerId === userId;
    if (!isCustomer && !isOwner) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return serializeDecimals(order);
  }

  async updateStatus(id: string, ownerId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { menuItem: true } } },
    });
    return serializeDecimals(updated);
  }
}
