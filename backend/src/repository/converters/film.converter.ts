import { FilmDto, ScheduleDto } from '../../films/dto/films.dto';
import { FilmEntity, ScheduleEntity } from '../mongodb/film.schema';

export function scheduleDtoToEntity(dto: ScheduleDto): ScheduleEntity {
  return {
    id: dto.id,
    daytime: dto.daytime,
    hall: dto.hall,
    rows: dto.rows,
    seats: dto.seats,
    price: dto.price,
    taken: dto.taken,
  };
}

export function filmDtoToEntity(
  dto: FilmDto,
  schedule: ScheduleDto[] = [],
): FilmEntity {
  return {
    id: dto.id,
    rating: dto.rating,
    director: dto.director,
    tags: dto.tags,
    image: dto.image,
    cover: dto.cover,
    title: dto.title,
    about: dto.about,
    description: dto.description,
    schedule: schedule.map(scheduleDtoToEntity),
  };
}

export function scheduleEntityToDto(entity: ScheduleEntity): ScheduleDto {
  return {
    id: entity.id,
    daytime: entity.daytime,
    hall: entity.hall,
    rows: entity.rows,
    seats: entity.seats,
    price: entity.price,
    taken: entity.taken,
  };
}

export function filmEntityToDto(entity: FilmEntity): FilmDto {
  return {
    id: entity.id,
    rating: entity.rating,
    director: entity.director,
    tags: entity.tags,
    title: entity.title,
    about: entity.about,
    description: entity.description,
    image: entity.image,
    cover: entity.cover,
  };
}
