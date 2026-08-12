import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested, ArrayMinSize } from 'class-validator';

class OrderItemInput {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateGuestOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];
}
