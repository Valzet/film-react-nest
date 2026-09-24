import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  const orderService = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: orderService }],
    }).compile();

    controller = module.get(OrderController);
  });

  it('createOrder sends dto', async () => {
    const dto: CreateOrderDto = {
      email: 'a@b.c',
      phone: '123',
      tickets: [],
    };
    const data = { total: 0, items: [] };
    orderService.createOrder.mockResolvedValue(data);

    await expect(controller.createOrder(dto)).resolves.toBe(data);
    expect(orderService.createOrder).toHaveBeenCalledWith(dto);
  });
});
