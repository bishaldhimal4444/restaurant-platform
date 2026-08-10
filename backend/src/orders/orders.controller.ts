import { Body, Controller, Get, Post, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthedRequest {
  user: { userId: string; email: string; role: string };
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req: AuthedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, dto);
  }

  @Get('mine')
  findMine(@Request() req: AuthedRequest) {
    return this.ordersService.findMineAsCustomer(req.user.userId);
  }

  @Get('received')
  findReceived(@Request() req: AuthedRequest) {
    return this.ordersService.findMineAsOwner(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthedRequest,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, req.user.userId, dto);
  }
}
