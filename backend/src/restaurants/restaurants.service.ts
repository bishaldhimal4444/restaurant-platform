import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto) {
    const existing = await this.prisma.restaurant.findFirst();
    if (existing) {
      throw new ConflictException('A restaurant already exists');
    }
    return this.prisma.restaurant.create({ data: dto });
  }

  async getTheRestaurant() {
    const restaurant = await this.prisma.restaurant.findFirst();
    if (!restaurant) {
      throw new NotFoundException('No restaurant has been set up yet');
    }
    return restaurant;
  }

  async update(dto: UpdateRestaurantDto) {
    const restaurant = await this.getTheRestaurant();
    return this.prisma.restaurant.update({
      where: { id: restaurant.id },
      data: dto,
    });
  }
}
