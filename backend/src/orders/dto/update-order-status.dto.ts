import { IsIn } from 'class-validator';
import { OrderStatus } from '@prisma/client';

const STATUSES: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];

export class UpdateOrderStatusDto {
  @IsIn(STATUSES)
  status: OrderStatus;
}
