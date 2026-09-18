import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configProvider } from '../app.config.provider';
import { unsupportedDatabaseDriverError } from '../common/errors';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { FILMS_REPOSITORY } from './films.repository';
import { AppRepository } from './app.repository';
import { FilmsMongoRepository } from './mongodb/films.mongodb.repository';
import { Film as MongoFilm, FilmSchema } from './mongodb/film.schema';

@Global()
@Module({})
export class RepositoryModule {
  static forRoot(): DynamicModule {
    const { driver } = configProvider.useFactory(new ConfigService()).database;

    if (driver === 'mongodb') {
      return {
        module: RepositoryModule,
        imports: [
          MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              uri: config.getOrThrow<string>('DATABASE_URL'),
            }),
          }),
          MongooseModule.forFeature([
            { name: MongoFilm.name, schema: FilmSchema },
          ]),
        ],
        providers: [
          {
            provide: FILMS_REPOSITORY,
            useClass: FilmsMongoRepository,
          },
        ],
        exports: [FILMS_REPOSITORY],
      };
    }

    if (driver === 'postgres') {
      return {
        module: RepositoryModule,
        imports: [
          TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
              const databaseUrl = new URL(
                config.getOrThrow<string>('DATABASE_URL'),
              );

              return {
                type: 'postgres' as const,
                host: databaseUrl.hostname,
                port: Number(databaseUrl.port || 5432),
                database: databaseUrl.pathname.replace(/^\//, ''),
                username: config.getOrThrow<string>('DATABASE_USERNAME'),
                password: config.getOrThrow<string>('DATABASE_PASSWORD'),
                entities: [Film, Schedule],
                synchronize: false,
              };
            },
          }),
          TypeOrmModule.forFeature([Film, Schedule]),
        ],
        providers: [
          {
            provide: FILMS_REPOSITORY,
            useClass: AppRepository,
          },
        ],
        exports: [FILMS_REPOSITORY],
      };
    }

    throw new Error(unsupportedDatabaseDriverError(driver));
  }
}
