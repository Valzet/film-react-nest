import { Injectable } from '@nestjs/common';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  createOrder(orderDto: CreateOrderDto): OrderResponseDto {
    return { total: 0, items: [] };
  }
}
