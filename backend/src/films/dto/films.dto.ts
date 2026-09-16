export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
}

export class FilmListResponseDto {
  total: number;
  items: FilmDto[];
}

export class ScheduleDto {
  id: string;
  daytime: string;
  hall: string;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class ScheduleListResponseDto {
  total: number;
  items: ScheduleDto[];
}
