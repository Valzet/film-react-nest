export const AppErrors = {
  FILM_NOT_FOUND: 'Фильм не найден',
  SEAT_ALREADY_TAKEN: 'Место уже занято',
} as const;

export function unsupportedDatabaseDriverError(driver: string): string {
  return `Неподдерживаемый DATABASE_DRIVER: ${driver}`;
}
