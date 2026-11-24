import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Carga mínima de server/.env sin dependencias externas.
const envFile = path.join(serverRoot, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET ?? (isProduction ? '' : 'infantiweb-dev-secret-solo-local');
if (!jwtSecret) throw new Error('Define JWT_SECRET para ejecutar en producción.');

export const config = {
  serverRoot,
  port: Number(process.env.API_PORT ?? 4000),
  isProduction,
  jwtSecret,
  dbPath: path.resolve(serverRoot, process.env.DB_PATH ?? 'data/infantiweb.db'),
  clientDist: path.resolve(serverRoot, '../client/dist'),
  sessionDays: 7,
  maxLoginFailures: 5,
  lockMinutes: 5,
};
