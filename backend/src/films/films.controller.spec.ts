import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  const filmsService = {
    getFilms: jest.fn(),
    getSchedule: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [{ provide: FilmsService, useValue: filmsService }],
    }).compile();

    controller = module.get(FilmsController);
  });

  it('getFilms = service answer', async () => {
    const data = { total: 1, items: [] };
    filmsService.getFilms.mockResolvedValue(data);

    await expect(controller.getFilms()).resolves.toBe(data);
  });

  it('getSchedule with id', async () => {
    const data = { total: 0, items: [] };
    filmsService.getSchedule.mockResolvedValue(data);

    await expect(controller.getSchedule('film-1')).resolves.toBe(data);
    expect(filmsService.getSchedule).toHaveBeenCalledWith('film-1');
  });
});
