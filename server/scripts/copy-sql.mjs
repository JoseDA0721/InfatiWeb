// Copia las migraciones SQL al build de producción.
import { cpSync } from 'node:fs';
cpSync('src/db/migrations', 'dist/db/migrations', { recursive: true });
