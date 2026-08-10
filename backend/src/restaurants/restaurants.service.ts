import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateRestaurantDto) {
    const existing = await this.prisma.restaurant.findUnique({ where: { ownerId } });
    if (existing) {
      throw new ConflictException('You already own a restaurant');
    }

    return this.prisma.restaurant.create({
      data: { ...dto, ownerId },
    });
  }

  async findAll() {
    return this.prisma.restaurant.findMany({
      include: { menuItems: { where: { isAvailable: true } } },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async update(id: string, userId: string, dto: UpdateRestaurantDto) {
    await this.assertOwnership(id, userId);
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertOwnership(id, userId);
    await this.prisma.restaurant.delete({ where: { id } });
    return { deleted: true };
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
