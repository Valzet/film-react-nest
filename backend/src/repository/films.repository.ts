import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export const FILMS_REPOSITORY = 'FILMS_REPOSITORY';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findScheduleByFilmId(filmId: string): Promise<ScheduleDto[]>;
  isSeatAvailable(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): Promise<boolean>;
  takeSeat(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): Promise<boolean>;
}
