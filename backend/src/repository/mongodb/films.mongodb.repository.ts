import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { FilmsRepository } from '../films.repository';
import {
  filmEntityToDto,
  scheduleEntityToDto,
} from '../converters/film.converter';
import { Film, FilmDocument } from './film.schema';

type SeatToBook = {
  filmId: string;
  sessionId: string;
  row: number;
  seat: number;
};

@Injectable()
export class FilmsMongoRepository implements FilmsRepository {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async findAll() {
    const films = await this.filmModel.find().lean().exec();
    return films.map(filmEntityToDto);
  }

  async findScheduleByFilmId(filmId: string) {
    const film = await this.filmModel.findOne({ id: filmId }).lean().exec();

    if (!film) {
      throw new NotFoundException('Film not found');
    }

    return (film.schedule ?? []).map(scheduleEntityToDto);
  }

  async takeSeats(seats: SeatToBook[]): Promise<boolean> {
    if (seats.length === 0) {
      return true;
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      for (const seat of seats) {
        const taken = await this.takeSeat(
          seat.filmId,
          seat.sessionId,
          seat.row,
          seat.seat,
          session,
        );

        if (!taken) {
          await session.abortTransaction();
          return false;
        }
      }

      await session.commitTransaction();
      return true;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction().catch(() => undefined);
      }

      if (this.isTransactionUnsupported(error)) {
        return this.takeSeatsWithRollback(seats);
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async takeSeat(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
    session?: ClientSession,
  ): Promise<boolean> {
    const seatKey = `${row}:${seat}`;

    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: { $nin: [seatKey] },
            },
          },
        },
        { $addToSet: { 'schedule.$[s].taken': seatKey } },
        {
          arrayFilters: [{ 's.id': sessionId }],
          ...(session ? { session } : {}),
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async releaseSeat(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): Promise<void> {
    const seatKey = `${row}:${seat}`;

    await this.filmModel
      .updateOne(
        { id: filmId, 'schedule.id': sessionId },
        { $pull: { 'schedule.$[s].taken': seatKey } },
        { arrayFilters: [{ 's.id': sessionId }] },
      )
      .exec();
  }

  private async takeSeatsWithRollback(seats: SeatToBook[]): Promise<boolean> {
    const reserved: SeatToBook[] = [];

    for (const seat of seats) {
      const taken = await this.takeSeat(
        seat.filmId,
        seat.sessionId,
        seat.row,
        seat.seat,
      );

      if (!taken) {
        for (const item of reserved) {
          await this.releaseSeat(
            item.filmId,
            item.sessionId,
            item.row,
            item.seat,
          );
        }
        return false;
      }

      reserved.push(seat);
    }

    return true;
  }

  private isTransactionUnsupported(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    const code = (error as { code?: number })?.code;

    return (
      code === 20 ||
      message.includes('Transaction numbers are only allowed') ||
      message.includes('replica set member or mongos')
    );
  }
}
