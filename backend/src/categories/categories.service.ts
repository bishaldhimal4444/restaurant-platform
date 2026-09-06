import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getRestaurantId() {
    const restaurant = await this.prisma.restaurant.findFirst();
    if (!restaurant) {
      throw new NotFoundException('No restaurant has been set up yet');
    }
    return restaurant.id;
  }

  async create(dto: CreateCategoryDto) {
    const restaurantId = await this.getRestaurantId();
    return this.prisma.category.create({
      data: { ...dto, restaurantId },
    });
  }

  async findAll() {
    const restaurantId = await this.getRestaurantId();
    return this.prisma.category.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { menuItems: true } } },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Menu items in this category fall back to "uncategorized" rather than being deleted.
    await this.prisma.menuItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }
}
