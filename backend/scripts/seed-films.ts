import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import mongoose from 'mongoose';
import { Film, FilmSchema } from '../src/repository/mongodb/film.schema';

async function seed() {
  const url = process.env.DATABASE_URL ?? 'mongodb://localhost:27017/afisha';

  await mongoose.connect(url);

  const stubPath = path.join(
    __dirname,
    '..',
    'test',
    'mongodb_initial_stub.json',
  );
  const films = JSON.parse(fs.readFileSync(stubPath, 'utf-8'));
  const FilmModel = mongoose.model(Film.name, FilmSchema, 'films');

  await FilmModel.deleteMany({});
  await FilmModel.insertMany(films);

  console.log(`Imported ${films.length} films into ${url}`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
