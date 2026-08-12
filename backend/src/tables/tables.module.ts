import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PublicTablesController } from './public-tables.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TablesController, PublicTablesController],
  providers: [TablesService],
})
export class TablesModule {}
