import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializeDecimals } from '../common/serialize';

function getDayRange(dateStr?: string) {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
  return { start, end };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDaily(dateStr?: string) {
    const { start, end } = getDayRange(dateStr);
    const dateKey = start.toISOString().slice(0, 10);

    const [
      ordersToday,
      sessionsToday,
      activeTables,
      pendingRequests,
      paidBillsToday,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: {
          status: true,
          items: {
            select: {
              menuItemId: true,
              quantity: true,
              menuItem: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.tableSession.findMany({
        where: { startedAt: { gte: start, lte: end } },
        include: {
          table: { select: { number: true } },
          orders: { include: { items: true } },
        },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.table.count({ where: { status: 'OCCUPIED' } }),
      this.prisma.tableSession.count({ where: { status: 'PENDING' } }),
      this.prisma.bill.findMany({
        where: { status: 'PAID', paidAt: { gte: start, lte: end } },
        select: { totalAmount: true, paymentMethod: true },
      }),
    ]);

    const ordersByStatus: Record<string, number> = {
      PENDING: 0,
      PREPARING: 0,
      READY: 0,
      SERVED: 0,
      CANCELLED: 0,
    };
    for (const o of ordersToday) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    const salesTotal = paidBillsToday.reduce(
      (sum, bill) => sum + Number(bill.totalAmount),
      0,
    );
    const salesByMethod = paidBillsToday.reduce(
      (acc, bill) => {
        const method = bill.paymentMethod ?? 'UNSPECIFIED';
        acc[method] = (acc[method] ?? 0) + Number(bill.totalAmount);
        return acc;
      },
      {} as Record<string, number>,
    );

    const itemTotals = new Map<string, { name: string; quantity: number }>();
    for (const order of ordersToday) {
      if (order.status === 'CANCELLED') continue;
      for (const item of order.items) {
        const existing = itemTotals.get(item.menuItemId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          itemTotals.set(item.menuItemId, { name: item.menuItem.name, quantity: item.quantity });
        }
      }
    }
    const topItems = Array.from(itemTotals.entries())
      .map(([menuItemId, v]) => ({ menuItemId, name: v.name, quantity: v.quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const customers = sessionsToday.map((session) => {
      const allItems = session.orders.flatMap((o) => o.items);
      const totalItems = allItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = allItems.reduce(
        (sum, i) => sum + i.quantity * Number(i.unitPrice),
        0,
      );
      return {
        sessionId: session.id,
        guestName: session.guestName ?? 'Guest',
        tableNumber: session.table?.number ?? null,
        totalItems,
        totalPrice,
        status: session.status,
      };
    });

    return serializeDecimals({
      date: dateKey,
      ordersCount: ordersToday.length,
      ordersByStatus,
      newCustomers: sessionsToday.length,
      activeTables,
      pendingRequests,
      salesTotal,
      salesByMethod,
      billsPaidCount: paidBillsToday.length,
      customers,
      topItems,
    });
  }
}
