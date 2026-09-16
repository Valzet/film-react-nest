import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import {
  FilmListResponseDto,
  ScheduleListResponseDto,
} from './dto/films.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  getFilms(): FilmListResponseDto {
    return this.filmsService.getFilms();
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') id: string): ScheduleListResponseDto {
    return this.filmsService.getSchedule(id);
  }
}
