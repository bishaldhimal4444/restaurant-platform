import { IsIn } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

const METHODS: PaymentMethod[] = ['CASH', 'ONLINE'];

export class PayBillDto {
  @IsIn(METHODS)
  paymentMethod: PaymentMethod;
}
