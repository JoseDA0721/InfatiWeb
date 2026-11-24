import { config } from './config.js';
import { createApp } from './app.js';
import { openDatabase } from './db/index.js';
import { isSeeded, seedDatabase } from './seed/seed.js';

const db = openDatabase(config.dbPath);
if (!isSeeded(db)) {
  seedDatabase(db);
  console.log('Base de datos creada y llenada con el contenido de demostración.');
}

const app = createApp(db, { serveClient: config.isProduction });
app.listen(config.port, () => {
  console.log(`API de InfantiWeb lista en http://localhost:${config.port}`);
});
