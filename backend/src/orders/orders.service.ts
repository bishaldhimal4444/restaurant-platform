import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { serializeDecimals } from '../common/serialize';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: dto.tableSessionId },
    });
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    if (session.status !== 'ACTIVE') {
      throw new ConflictException('This table session is not active');
    }

    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items are invalid');
    }

    const unavailable = menuItems.filter((m) => !m.isAvailable);
    if (unavailable.length > 0) {
      throw new BadRequestException(
        `Unavailable items: ${unavailable.map((m) => m.name).join(', ')}`,
      );
    }

    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    const orderItemsData = dto.items.map((input) => {
      const menuItem = menuItemMap.get(input.menuItemId)!;
      return {
        menuItemId: input.menuItemId,
        quantity: input.quantity,
        unitPrice: menuItem.price,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        tableSessionId: dto.tableSessionId,
        items: { create: orderItemsData },
      },
      include: { items: { include: { menuItem: true } } },
    });

    return serializeDecimals(order);
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: {
        items: { include: { menuItem: true } },
        tableSession: { include: { table: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return serializeDecimals(orders);
  }

  async findActive() {
    const orders = await this.prisma.order.findMany({
      where: { status: { notIn: ['SERVED', 'CANCELLED'] } },
      include: {
        items: { include: { menuItem: true } },
        tableSession: { include: { table: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return serializeDecimals(orders);
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        tableSession: { include: { table: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return serializeDecimals(order);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { menuItem: true } } },
    });
    return serializeDecimals(updated);
  }
}
