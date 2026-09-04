import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { serializeDecimals } from '../common/serialize';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const customers = await this.prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { visitCount: 'desc' },
    });
    return serializeDecimals(customers);
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { startedAt: 'desc' },
          include: { table: true, bill: true },
        },
      },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return serializeDecimals(customer);
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const updated = await this.prisma.customer.update({ where: { id }, data: dto });
    return serializeDecimals(updated);
  }
}
