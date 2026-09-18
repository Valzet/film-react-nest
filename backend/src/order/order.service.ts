import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';
import { AppErrors } from '../common/errors';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async createOrder(orderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const seatsInOrder = new Set<string>();

    for (const ticket of orderDto.tickets) {
      const seatKey = this.formatSeatKey(
        ticket.film,
        ticket.session,
        ticket.row,
        ticket.seat,
      );

      if (seatsInOrder.has(seatKey)) {
        throw new BadRequestException({ error: AppErrors.SEAT_ALREADY_TAKEN });
      }

      seatsInOrder.add(seatKey);
    }

    const booked = await this.filmsRepository.takeSeats(
      orderDto.tickets.map((ticket) => ({
        filmId: ticket.film,
        sessionId: ticket.session,
        row: ticket.row,
        seat: ticket.seat,
      })),
    );

    if (!booked) {
      throw new BadRequestException({ error: AppErrors.SEAT_ALREADY_TAKEN });
    }

    const items = orderDto.tickets.map((ticket) => ({
      ...ticket,
      id: randomUUID(),
    }));

    return { total: items.length, items };
  }

  private formatSeatKey(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): string {
    return `${filmId}:${sessionId}:${row}:${seat}`;
  }
}
