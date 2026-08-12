import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayBillDto } from './dto/pay-bill.dto';
import { serializeDecimals } from '../common/serialize';
import { Decimal } from '@prisma/client/runtime/client.js';

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(tableSessionId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: tableSessionId },
      include: {
        bill: true,
        orders: {
          where: { status: { not: 'CANCELLED' } },
          include: { items: true },
        },
      },
    });
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    if (session.bill) {
      throw new ConflictException('A bill already exists for this session');
    }

    const totalAmount = session.orders
      .flatMap((order) => order.items)
      .reduce((sum, item) => sum.plus(item.unitPrice.times(item.quantity)), new Decimal(0));

    const bill = await this.prisma.$transaction(async (tx) => {
      const created = await tx.bill.create({
        data: { tableSessionId, totalAmount },
      });
      await tx.tableSession.update({
        where: { id: tableSessionId },
        data: { status: 'BILLED' },
      });
      return created;
    });

    return serializeDecimals(bill);
  }

  async findOne(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: { tableSession: { include: { table: true } } },
    });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    return serializeDecimals(bill);
  }

  // Raw (unserialized) lookup used for ownership checks — not exposed directly to guests.
  async findOneRaw(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: { tableSession: true },
    });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    return bill;
  }

  async pay(id: string, dto: PayBillDto) {
    const bill = await this.prisma.bill.findUnique({ where: { id } });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    if (bill.status === 'PAID') {
      throw new ConflictException('This bill is already paid');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const paid = await tx.bill.update({
        where: { id },
        data: { status: 'PAID', paymentMethod: dto.paymentMethod, paidAt: new Date() },
      });

      const session = await tx.tableSession.update({
        where: { id: paid.tableSessionId },
        data: { status: 'CLOSED', endedAt: new Date() },
      });

      await tx.table.update({
        where: { id: session.tableId },
        data: { status: 'AVAILABLE' },
      });

      return paid;
    });

    return serializeDecimals(updated);
  }
}
