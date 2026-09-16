import { Inject, Injectable } from '@nestjs/common';
import { FilmListResponseDto, ScheduleListResponseDto } from './dto/films.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async getFilms(): Promise<FilmListResponseDto> {
    const items = await this.filmsRepository.findAll();
    return { total: items.length, items };
  }

  async getSchedule(id: string): Promise<ScheduleListResponseDto> {
    const items = await this.filmsRepository.findScheduleByFilmId(id);
    return { total: items.length, items };
  }
}
