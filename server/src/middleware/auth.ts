import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from '../lib/http.js';

export type Role = 'nino' | 'familia';

/** Cookies separadas: un adulto puede entrar con su PIN sin cerrar la sesión del niño. */
export const COOKIE: Record<Role, string> = { nino: 'iw_child', familia: 'iw_family' };

interface TokenPayload {
  sub: number;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    childId?: number;
    parentId?: number;
  }
}

export function setSession(res: Response, role: Role, userId: number) {
  const token = jwt.sign({ sub: userId, role } satisfies TokenPayload, config.jwtSecret, {
    expiresIn: `${config.sessionDays}d`,
  });
  res.cookie(COOKIE[role], token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSession(res: Response, role: Role) {
  res.clearCookie(COOKIE[role], { path: '/' });
}

function readToken(req: Request, role: Role): number | null {
  const token = req.cookies?.[COOKIE[role]];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret) as unknown as TokenPayload;
    return payload.role === role ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

export function requireChild(req: Request, _res: Response, next: NextFunction) {
  const id = readToken(req, 'nino');
  if (!id) throw new HttpError(401, 'Necesitas entrar con tu nombre y tu clave.', 'unauthenticated');
  req.childId = id;
  next();
}

export function requireFamily(req: Request, _res: Response, next: NextFunction) {
  const id = readToken(req, 'familia');
  if (!id) throw new HttpError(401, 'Ingresa con el PIN de familia para ver esta sección.', 'unauthenticated');
  req.parentId = id;
  next();
}

export function optionalSessions(req: Request) {
  return { childId: readToken(req, 'nino'), parentId: readToken(req, 'familia') };
}
