import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export const FILMS_REPOSITORY = 'FILMS_REPOSITORY';

export type SeatToBook = {
  filmId: string;
  sessionId: string;
  row: number;
  seat: number;
};

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findScheduleByFilmId(filmId: string): Promise<ScheduleDto[] | null>;
  takeSeats(seats: SeatToBook[]): Promise<boolean>;
}
