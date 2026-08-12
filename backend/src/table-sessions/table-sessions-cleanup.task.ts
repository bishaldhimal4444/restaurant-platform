import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

const PENDING_TTL_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class TableSessionsCleanupTask {
  private readonly logger = new Logger(TableSessionsCleanupTask.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/1 * * * *')
  async releaseStalePendingSessions() {
    const cutoff = new Date(Date.now() - PENDING_TTL_MS);

    const stale = await this.prisma.tableSession.findMany({
      where: { status: 'PENDING', startedAt: { lt: cutoff } },
    });

    for (const session of stale) {
      await this.prisma.$transaction(async (tx) => {
        await tx.tableSession.update({
          where: { id: session.id },
          data: { status: 'CLOSED', endedAt: new Date() },
        });
        await tx.table.update({
          where: { id: session.tableId },
          data: { status: 'AVAILABLE' },
        });
      });
      this.logger.log(`Auto-released stale pending session ${session.id} (table ${session.tableId})`);
    }
  }
}
