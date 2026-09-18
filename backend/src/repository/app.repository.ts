import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { FilmsRepository, SeatToBook } from './films.repository';
import {
  filmEntityToDto,
  scheduleEntityToDto,
} from './converters/film.converter';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { AppErrors } from '../common/errors';

class SeatConflictError extends Error {
  constructor() {
    super(AppErrors.SEAT_ALREADY_TAKEN);
  }
}

@Injectable()
export class AppRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find();
    return films.map(filmEntityToDto);
  }

  async findScheduleByFilmId(filmId: string): Promise<ScheduleDto[]> {
    const film = await this.filmRepository.findOne({
      where: { id: filmId },
      relations: ['schedule'],
    });

    if (!film) {
      throw new NotFoundException(AppErrors.FILM_NOT_FOUND);
    }

    return (film.schedule ?? [])
      .sort((left, right) => left.daytime.localeCompare(right.daytime))
      .map(scheduleEntityToDto);
  }

  async takeSeats(seats: SeatToBook[]): Promise<boolean> {
    if (seats.length === 0) {
      return true;
    }

    try {
      await this.scheduleRepository.manager.transaction(async (manager) => {
        for (const seat of seats) {
          const taken = await this.takeSeatWithManager(
            manager,
            seat.filmId,
            seat.sessionId,
            seat.row,
            seat.seat,
          );

          if (!taken) {
            throw new SeatConflictError();
          }
        }
      });

      return true;
    } catch (error) {
      if (error instanceof SeatConflictError) {
        return false;
      }

      throw error;
    }
  }

  async takeSeat(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    return this.scheduleRepository.manager.transaction((manager) =>
      this.takeSeatWithManager(manager, filmId, sessionId, row, seat),
    );
  }

  async releaseSeat(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: sessionId, filmId },
    });

    if (!schedule) {
      return;
    }

    const seatKey = `${row}:${seat}`;
    schedule.taken = this.getTakenSeats(schedule).filter(
      (item) => item !== seatKey,
    );
    await this.scheduleRepository.save(schedule);
  }

  private async takeSeatWithManager(
    manager: EntityManager,
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const schedule = await manager
      .getRepository(Schedule)
      .createQueryBuilder('schedule')
      .setLock('pessimistic_write')
      .where('schedule.id = :sessionId', { sessionId })
      .andWhere('schedule.filmId = :filmId', { filmId })
      .getOne();

    if (!schedule) {
      return false;
    }

    const seatKey = `${row}:${seat}`;
    const taken = this.getTakenSeats(schedule);

    if (taken.includes(seatKey)) {
      return false;
    }

    schedule.taken = [...taken, seatKey];
    await manager.save(schedule);
    return true;
  }

  private getTakenSeats(schedule: Schedule): string[] {
    return schedule.taken ?? [];
  }
}
