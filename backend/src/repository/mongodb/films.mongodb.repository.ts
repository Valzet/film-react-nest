import { Injectable } from '@nestjs/common';
import { FilmsRepository } from '../films.repository';
import {
  filmEntityToDto,
  scheduleEntityToDto,
} from '../converters/film.converter';
import { FilmModel } from './film.schema';

@Injectable()
export class FilmsMongoRepository implements FilmsRepository {
  async findAll() {
    const films = await FilmModel.find().lean().exec();
    return films.map(filmEntityToDto);
  }

  async findScheduleByFilmId(filmId: string) {
    const film = await FilmModel.findOne({ id: filmId }).lean().exec();

    if (!film) {
      return [];
    }

    return film.schedule.map(scheduleEntityToDto);
  }

  async isSeatAvailable(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ) {
    const film = await FilmModel.findOne({ id: filmId }).lean().exec();

    if (!film) {
      return false;
    }

    const session = film.schedule.find(({ id }) => id === sessionId);

    if (!session) {
      return false;
    }

    const seatKey = `${row}:${seat}`;
    return !session.taken.includes(seatKey);
  }

  async takeSeat(filmId: string, sessionId: string, row: number, seat: number) {
    const seatKey = `${row}:${seat}`;

    const result = await FilmModel.updateOne(
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
      { arrayFilters: [{ 's.id': sessionId }] },
    ).exec();

    return result.modifiedCount > 0;
  }
}
