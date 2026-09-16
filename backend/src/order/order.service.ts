import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';
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
        throw new BadRequestException({ error: 'Seat already taken' });
      }

      seatsInOrder.add(seatKey);
    }

    for (const ticket of orderDto.tickets) {
      const isAvailable = await this.filmsRepository.isSeatAvailable(
        ticket.film,
        ticket.session,
        ticket.row,
        ticket.seat,
      );

      if (!isAvailable) {
        throw new BadRequestException({ error: 'Seat already taken' });
      }
    }

    const items = [];

    for (const ticket of orderDto.tickets) {
      const isTaken = await this.filmsRepository.takeSeat(
        ticket.film,
        ticket.session,
        ticket.row,
        ticket.seat,
      );

      if (!isTaken) {
        throw new BadRequestException({ error: 'Seat already taken' });
      }

      items.push({
        ...ticket,
        id: randomUUID(),
      });
    }

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
