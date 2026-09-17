import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { FilmsRepository, SeatToBook } from '../films.repository';
import {
  filmEntityToDto,
  scheduleEntityToDto,
} from '../converters/film.converter';
import { Film, FilmDocument } from './film.schema';

type SeatGroup = {
  filmId: string;
  sessionId: string;
  seatKeys: string[];
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
      return null;
    }

    return (film.schedule ?? []).map(scheduleEntityToDto);
  }

  async takeSeats(seats: SeatToBook[]): Promise<boolean> {
    if (seats.length === 0) {
      return true;
    }

    const groups = this.groupSeats(seats);
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      for (const group of groups) {
        const taken = await this.takeSeatGroup(group, session);

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
        return this.takeSeatGroupsWithRollback(groups);
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  private groupSeats(seats: SeatToBook[]): SeatGroup[] {
    const groups = new Map<string, SeatGroup>();

    for (const seat of seats) {
      const groupKey = `${seat.filmId}:${seat.sessionId}`;
      const seatKey = `${seat.row}:${seat.seat}`;
      const existing = groups.get(groupKey);

      if (existing) {
        existing.seatKeys.push(seatKey);
      } else {
        groups.set(groupKey, {
          filmId: seat.filmId,
          sessionId: seat.sessionId,
          seatKeys: [seatKey],
        });
      }
    }

    return [...groups.values()];
  }

  private async takeSeatGroupsWithRollback(
    groups: SeatGroup[],
  ): Promise<boolean> {
    const reserved: SeatGroup[] = [];

    for (const group of groups) {
      const taken = await this.takeSeatGroup(group);

      if (!taken) {
        await Promise.all(
          reserved.map((reservedGroup) => this.releaseSeatGroup(reservedGroup)),
        );
        return false;
      }

      reserved.push(group);
    }

    return true;
  }

  private async takeSeatGroup(
    group: SeatGroup,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        {
          id: group.filmId,
          schedule: {
            $elemMatch: {
              id: group.sessionId,
              taken: { $nin: group.seatKeys },
            },
          },
        },
        { $addToSet: { 'schedule.$[s].taken': { $each: group.seatKeys } } },
        {
          arrayFilters: [{ 's.id': group.sessionId }],
          ...(session ? { session } : {}),
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  private async releaseSeatGroup(group: SeatGroup): Promise<void> {
    await this.filmModel
      .updateOne(
        { id: group.filmId, 'schedule.id': group.sessionId },
        { $pullAll: { 'schedule.$[s].taken': group.seatKeys } },
        { arrayFilters: [{ 's.id': group.sessionId }] },
      )
      .exec();
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
