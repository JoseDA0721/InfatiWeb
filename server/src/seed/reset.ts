import { rmSync } from 'node:fs';
import { config } from '../config.js';
import { openDatabase } from '../db/index.js';
import { seedDatabase } from './seed.js';

for (const suffix of ['', '-wal', '-shm']) rmSync(config.dbPath + suffix, { force: true });
const db = openDatabase(config.dbPath);
seedDatabase(db);
db.close();
console.log(`Base reiniciada en ${config.dbPath}`);
