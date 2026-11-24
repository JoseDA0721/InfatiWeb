import cookieParser from 'cookie-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { config } from './config.js';
import type { DB } from './db/index.js';
import { HttpError } from './lib/http.js';
import { authRouter } from './routes/auth.js';
import { childRouter } from './routes/child.js';
import { familyRouter } from './routes/family.js';

export function createApp(db: DB, options: { serveClient?: boolean } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", 'data:'],
        },
      },
    }),
  );
  app.use(express.json({ limit: '50kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter(db));
  app.use('/api/family', familyRouter(db));
  app.use('/api', childRouter(db));
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Esa ruta de la API no existe.')));

  // En producción, el mismo servidor entrega la app de React ya compilada.
  if (options.serveClient && existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist, { index: false, maxAge: '1h' }));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(config.clientDist, 'index.html')));
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      const first = err.issues[0];
      return res.status(400).json({ error: first?.message ?? 'Revisa los datos e inténtalo otra vez.', code: 'validation' });
    }
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message, code: err.code, ...err.extra });
    }
    if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'No pudimos leer los datos enviados.', code: 'bad_json' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Algo no salió bien. Inténtalo otra vez en un momento.', code: 'server' });
  });

  return app;
}
