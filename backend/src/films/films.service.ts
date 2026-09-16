import { Injectable } from '@nestjs/common';
import {
  FilmListResponseDto,
  ScheduleListResponseDto,
} from './dto/films.dto';

@Injectable()
export class FilmsService {
  getFilms(): FilmListResponseDto {
    return { total: 0, items: [] };
  }

  getSchedule(id: string): ScheduleListResponseDto {
    return { total: 0, items: [] };
  }
}
