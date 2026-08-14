import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getRestaurantId() {
    const restaurant = await this.prisma.restaurant.findFirst();
    if (!restaurant) {
      throw new NotFoundException('No restaurant has been set up yet');
    }
    return restaurant.id;
  }

  async create(dto: CreateTableDto) {
    const restaurantId = await this.getRestaurantId();
    return this.prisma.table.create({ data: { ...dto, restaurantId } });
  }

  async findAll() {
    const restaurantId = await this.getRestaurantId();
    return this.prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: 'asc' },
      include: {
        sessions: {
          where: { status: { in: ['PENDING', 'ACTIVE'] } },
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
      },
    });
  }

  // Public, guest-facing listing. Deliberately excludes guest PII
  // (name/phone/email) and internal session detail — only what's
  // needed to pick a table: number, capacity, and availability.
  async findAllPublic() {
    const restaurantId = await this.getRestaurantId();
    return this.prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        capacity: true,
        status: true,
      },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        sessions: {
          where: { status: { in: ['PENDING', 'ACTIVE'] } },
          take: 1,
          orderBy: { startedAt: 'desc' },
          include: { orders: { include: { items: { include: { menuItem: true } } } } },
        },
      },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async update(id: string, dto: UpdateTableDto) {
    await this.findOne(id);
    return this.prisma.table.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.table.delete({ where: { id } });
    return { deleted: true };
  }
}
