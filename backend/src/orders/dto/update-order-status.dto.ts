import { IsIn } from 'class-validator';
import { OrderStatus } from '@prisma/client';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export class UpdateOrderStatusDto {
  @IsIn(STATUSES)
  status: OrderStatus;
}
