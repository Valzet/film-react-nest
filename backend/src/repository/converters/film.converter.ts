import { FilmDto, ScheduleDto } from '../../films/dto/films.dto';
import { Film } from '../../films/entities/film.entity';
import { Schedule } from '../../films/entities/schedule.entity';

export function scheduleEntityToDto(entity: Schedule): ScheduleDto {
  return {
    id: entity.id,
    daytime: entity.daytime,
    hall: entity.hall,
    rows: entity.rows,
    seats: entity.seats,
    price: entity.price,
    taken: entity.taken ?? [],
  };
}

export function filmEntityToDto(entity: Film): FilmDto {
  return {
    id: entity.id,
    rating: entity.rating,
    director: entity.director,
    tags: entity.tags ?? [],
    title: entity.title,
    about: entity.about,
    description: entity.description,
    image: entity.image,
    cover: entity.cover,
  };
}
