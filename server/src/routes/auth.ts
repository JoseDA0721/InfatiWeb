import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from '../config.js';
import type { DB } from '../db/index.js';
import { HttpError } from '../lib/http.js';
import { PICTURE_KEYS, pictureKeyString } from '../lib/pictures.js';
import { normalizeAnswer, normalizeUsername } from '../lib/text.js';
import { clearSession, optionalSessions, setSession, type Role } from '../middleware/auth.js';

interface UserRow {
  id: number;
  role: Role;
  display_name: string;
  username: string;
  password_hash: string | null;
  picture_hash: string | null;
  pin_hash: string | null;
  security_question: string | null;
  security_answer_hash: string | null;
  failed_attempts: number;
  locked_until: string | null;
}

const childLogin = z.object({
  name: z.string().trim().min(1, 'Escribe tu nombre.').max(40),
  password: z.string().max(60).optional(),
  pictures: z.array(z.enum(PICTURE_KEYS)).length(3).optional(),
});

const familyLogin = z.object({
  username: z.string().trim().min(1, 'Escribe el usuario de familia.').max(60),
  pin: z.string().regex(/^\d{4}$/, 'El PIN tiene 4 números.'),
});

const resetRequest = z
  .object({
    childName: z.string().trim().min(1).max(40),
    familyUsername: z.string().trim().min(1).max(60),
    pin: z.string().regex(/^\d{4}$/, 'El PIN tiene 4 números.'),
    newPassword: z.string().trim().min(4, 'La clave nueva necesita al menos 4 caracteres.').max(60).optional(),
    newPictures: z.array(z.enum(PICTURE_KEYS)).length(3).optional(),
  })
  .refine((v) => v.newPassword || v.newPictures, { message: 'Elige una clave nueva.' });

const pinRecovery = z.object({
  username: z.string().trim().min(1).max(60),
  answer: z.string().trim().min(1, 'Escribe la respuesta.').max(80),
  newPin: z.string().regex(/^\d{4}$/, 'El PIN nuevo tiene 4 números.'),
});

export function authRouter(db: DB) {
  const router = Router();

  router.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 60,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      skip: (req) => req.method === 'GET',
      message: { error: 'Hiciste muchos intentos seguidos. Espera unos minutos y vuelve a intentarlo.' },
    }),
  );

  const findUser = (username: string, role: Role) =>
    db.prepare('SELECT * FROM users WHERE username = ? AND role = ?').get(normalizeUsername(username), role) as
      | UserRow
      | undefined;

  function assertNotLocked(user: UserRow) {
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutes = Math.max(1, Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000));
      throw new HttpError(
        423,
        `Tomemos una pausa. Puedes intentarlo otra vez en ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} o pedir ayuda a un adulto.`,
        'locked',
        { minutes },
      );
    }
  }

  function registerFailure(user: UserRow | undefined, message: string): never {
    if (!user) throw new HttpError(401, message, 'invalid_credentials');
    const failures = user.failed_attempts + 1;
    if (failures >= config.maxLoginFailures) {
      const until = new Date(Date.now() + config.lockMinutes * 60000).toISOString();
      db.prepare('UPDATE users SET failed_attempts = 0, locked_until = ? WHERE id = ?').run(until, user.id);
      throw new HttpError(
        423,
        `Tomemos una pausa. Puedes intentarlo otra vez en ${config.lockMinutes} minutos o pedir ayuda a un adulto.`,
        'locked',
        { minutes: config.lockMinutes },
      );
    }
    db.prepare('UPDATE users SET failed_attempts = ? WHERE id = ?').run(failures, user.id);
    throw new HttpError(401, message, 'invalid_credentials', {
      attemptsLeft: config.maxLoginFailures - failures,
    });
  }

  const clearFailures = (id: number) =>
    db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(id);

  const childSummary = (id: number) =>
    db
      .prepare(
        `SELECT u.id, u.display_name AS name, u.avatar_id AS avatarId, p.tutorial_done AS tutorialDone
         FROM users u JOIN child_progress p ON p.child_id = u.id WHERE u.id = ?`,
      )
      .get(id) as { id: number; name: string; avatarId: number; tutorialDone: number } | undefined;

  router.get('/pictures', (_req, res) => {
    res.json({ pictures: PICTURE_KEYS });
  });

  router.get('/session', (req, res) => {
    const { childId, parentId } = optionalSessions(req);
    const child = childId ? childSummary(childId) : undefined;
    const family = parentId
      ? (db.prepare("SELECT id, display_name AS name FROM users WHERE id = ? AND role = 'familia'").get(parentId) as
          | { id: number; name: string }
          | undefined)
      : undefined;
    res.json({
      child: child ? { ...child, tutorialDone: Boolean(child.tutorialDone) } : null,
      family: family ?? null,
    });
  });

  router.post('/child-login', (req, res) => {
    const body = childLogin.parse(req.body);
    const user = findUser(body.name, 'nino');
    if (user) assertNotLocked(user);
    const generic = 'Ese nombre o esa clave no coinciden. Revisa y vuelve a intentarlo.';

    let ok = false;
    if (user && body.pictures && user.picture_hash) {
      ok = bcrypt.compareSync(pictureKeyString(body.pictures), user.picture_hash);
    } else if (user && body.password && user.password_hash) {
      ok = bcrypt.compareSync(body.password.trim(), user.password_hash);
    }
    if (!body.password && !body.pictures) throw new HttpError(400, 'Escribe tu clave secreta o elige tus imágenes.');
    if (!ok) registerFailure(user, generic);

    clearFailures(user!.id);
    setSession(res, 'nino', user!.id);
    const child = childSummary(user!.id)!;
    res.json({ child: { ...child, tutorialDone: Boolean(child.tutorialDone) } });
  });

  router.post('/family-login', (req, res) => {
    const body = familyLogin.parse(req.body);
    const user = findUser(body.username, 'familia');
    if (user) assertNotLocked(user);
    const ok = Boolean(user?.pin_hash && bcrypt.compareSync(body.pin, user.pin_hash));
    if (!ok) registerFailure(user, 'El usuario o el PIN no coinciden. Revisa e inténtalo de nuevo.');
    clearFailures(user!.id);
    setSession(res, 'familia', user!.id);
    res.json({ family: { id: user!.id, name: user!.display_name } });
  });

  /** Restablecer la clave del niño con ayuda de un adulto (PIN de familia). */
  router.post('/reset-request', (req, res) => {
    const body = resetRequest.parse(req.body);
    const parent = findUser(body.familyUsername, 'familia');
    if (parent) assertNotLocked(parent);
    const pinOk = Boolean(parent?.pin_hash && bcrypt.compareSync(body.pin, parent.pin_hash));
    if (!pinOk) registerFailure(parent, 'El usuario de familia o el PIN no coinciden.');

    const child = findUser(body.childName, 'nino');
    const linked =
      child &&
      db.prepare('SELECT 1 FROM family_links WHERE parent_id = ? AND child_id = ?').get(parent!.id, child.id);
    if (!child || !linked) {
      throw new HttpError(404, 'No encontramos a ese niño o niña en esta familia. Revisa cómo se escribe su nombre.');
    }
    clearFailures(parent!.id);
    if (body.newPassword) {
      db.prepare('UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?').run(
        bcrypt.hashSync(body.newPassword, 10),
        child.id,
      );
    }
    if (body.newPictures) {
      db.prepare('UPDATE users SET picture_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?').run(
        bcrypt.hashSync(pictureKeyString(body.newPictures), 10),
        child.id,
      );
    }
    res.json({ ok: true, childName: child.display_name });
  });

  router.post('/pin-question', (req, res) => {
    const { username } = z.object({ username: z.string().trim().min(1).max(60) }).parse(req.body);
    const user = findUser(username, 'familia');
    if (!user?.security_question) {
      throw new HttpError(404, 'No encontramos esa cuenta de familia. Revisa el usuario.');
    }
    res.json({ question: user.security_question });
  });

  router.post('/pin-recovery', (req, res) => {
    const body = pinRecovery.parse(req.body);
    const user = findUser(body.username, 'familia');
    if (user) assertNotLocked(user);
    const ok = Boolean(
      user?.security_answer_hash && bcrypt.compareSync(normalizeAnswer(body.answer), user.security_answer_hash),
    );
    if (!ok) registerFailure(user, 'La respuesta no coincide. Revisa e inténtalo otra vez.');
    db.prepare('UPDATE users SET pin_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?').run(
      bcrypt.hashSync(body.newPin, 10),
      user!.id,
    );
    res.json({ ok: true });
  });

  router.post('/logout', (req, res) => {
    const { role } = z.object({ role: z.enum(['nino', 'familia', 'todos']).default('todos') }).parse(req.body ?? {});
    if (role === 'nino' || role === 'todos') clearSession(res, 'nino');
    if (role === 'familia' || role === 'todos') clearSession(res, 'familia');
    res.json({ ok: true });
  });

  return router;
}
