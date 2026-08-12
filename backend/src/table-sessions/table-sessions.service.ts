import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableSessionDto } from './dto/create-table-session.dto';
import { serializeDecimals } from '../common/serialize';

@Injectable()
export class TableSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async open(tableId: string, dto: CreateTableSessionDto, guestToken: string) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    if (table.status === 'OCCUPIED') {
      throw new ConflictException('This table already has an active session');
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.tableSession.create({
        data: {
          tableId,
          ...dto,
          guestToken,
          status: 'PENDING',
        },
      });
      // Reserve the table immediately so it can't be double-booked
      // while the check-in is awaiting staff confirmation.
      await tx.table.update({ where: { id: tableId }, data: { status: 'OCCUPIED' } });
      return created;
    });

    return serializeDecimals(session);
  }

  async confirm(id: string) {
    const session = await this.prisma.tableSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    if (session.status !== 'PENDING') {
      throw new ConflictException('This session is not awaiting confirmation');
    }

    const updated = await this.prisma.tableSession.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    return serializeDecimals(updated);
  }

  async reject(id: string) {
    const session = await this.prisma.tableSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    if (session.status !== 'PENDING') {
      throw new ConflictException('This session is not awaiting confirmation');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const closed = await tx.tableSession.update({
        where: { id },
        data: { status: 'CLOSED', endedAt: new Date() },
      });
      await tx.table.update({ where: { id: session.tableId }, data: { status: 'AVAILABLE' } });
      return closed;
    });

    return serializeDecimals(updated);
  }

  async findPending() {
    const sessions = await this.prisma.tableSession.findMany({
      where: { status: 'PENDING' },
      include: { table: true },
      orderBy: { startedAt: 'asc' },
    });
    return serializeDecimals(sessions);
  }

  async findActiveForTable(tableId: string) {
    const session = await this.prisma.tableSession.findFirst({
      where: { tableId, status: 'ACTIVE' },
      include: { orders: { include: { items: { include: { menuItem: true } } } }, bill: true, table: true },
      orderBy: { startedAt: 'desc' },
    });
    if (!session) {
      throw new NotFoundException('No active session for this table');
    }
    return serializeDecimals(session);
  }

  async findOne(id: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id },
      include: { orders: { include: { items: { include: { menuItem: true } } } }, bill: true, table: true },
    });
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    return serializeDecimals(session);
  }

  async close(id: string) {
    const session = await this.prisma.tableSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    if (session.status !== 'ACTIVE') {
      throw new ConflictException('This session is not active');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const closed = await tx.tableSession.update({
        where: { id },
        data: { status: 'CLOSED', endedAt: new Date() },
      });
      await tx.table.update({ where: { id: session.tableId }, data: { status: 'AVAILABLE' } });
      return closed;
    });

    return serializeDecimals(updated);
  }

  async findByGuestToken(guestToken: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { guestToken },
      include: { orders: { include: { items: { include: { menuItem: true } } } }, bill: true, table: true },
    });
    if (!session) {
      throw new NotFoundException('No active session found for this guest token');
    }
    return serializeDecimals(session);
  }

  async findOneRaw(id: string) {
    const session = await this.prisma.tableSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    return session;
  }

  assertGuestOwnsSession(session: { guestToken: string | null; guestTokenExpiresAt: Date | null }, guestToken: string) {
    if (!session.guestToken || session.guestToken !== guestToken) {
      throw new UnauthorizedException('This session does not belong to you');
    }
    if (session.guestTokenExpiresAt && session.guestTokenExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Your session has expired');
    }
  }
}
