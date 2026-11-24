import bcrypt from 'bcryptjs';
import { Router, type Request } from 'express';
import { z } from 'zod';
import type { DB } from '../db/index.js';
import { HttpError } from '../lib/http.js';
import { PICTURE_KEYS, pictureKeyString } from '../lib/pictures.js';
import { dayKey, startOfWeek, weekDays } from '../lib/time.js';
import { clearSession, requireFamily } from '../middleware/auth.js';
import { levelProgress, skillLevel } from '../services/gamification.js';
import { buildMap, childProfile, rewardsFor, weeklyStatus } from '../services/progress.js';

const SKILLS = [
  {
    code: 'reconocimiento',
    title: 'Reconocimiento',
    practiced: 'Ha practicado reconocer emociones en caras y en situaciones de todos los días.',
  },
  {
    code: 'comprension',
    title: 'Comprensión',
    practiced: 'Ha practicado relacionar cada emoción con lo que la provoca y con cómo se siente en el cuerpo.',
  },
  {
    code: 'expresion',
    title: 'Expresión',
    practiced: 'Ha practicado formas de decir lo que siente y lo que necesita.',
  },
  {
    code: 'regulacion',
    title: 'Regulación',
    practiced: 'Ha practicado estrategias para calmarse, como respirar, moverse y pedir ayuda.',
  },
] as const;

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function familyRouter(db: DB) {
  const router = Router();
  router.use(requireFamily);

  /** Valida el vínculo familia–niño en cada ruta /family/:childId. */
  function linkedChild(req: Request) {
    const childId = z.coerce.number().int().positive().parse(req.params.childId);
    const link = db.prepare('SELECT 1 FROM family_links WHERE parent_id = ? AND child_id = ?').get(req.parentId, childId);
    if (!link) throw new HttpError(404, 'No encontramos a ese niño o niña en tu familia.');
    return childId;
  }

  function skillsOf(childId: number) {
    const map = buildMap(db, childId);
    return SKILLS.map((skill) => {
      const modules = map.modules.filter((m) => m.skill === skill.code);
      const earned = modules.reduce((s, m) => s + m.starsEarned, 0);
      const possible = modules.reduce((s, m) => s + m.starsPossible, 0);
      const percent = possible ? Math.round((earned / possible) * 100) : 0;
      const level = skillLevel(percent);
      const completed = modules.reduce((s, m) => s + m.completedCount, 0);
      const total = modules.reduce((s, m) => s + m.total, 0);
      return {
        code: skill.code,
        title: skill.title,
        percent,
        level,
        completed,
        total,
        description:
          level === 'Por explorar'
            ? `Todavía no ha jugado actividades de ${skill.title.toLowerCase()}. Pueden descubrirlas juntos.`
            : skill.practiced,
      };
    });
  }

  function usageOf(childId: number) {
    const now = new Date();
    const days = weekDays(now);
    const rows = db
      .prepare('SELECT day, seconds FROM usage_daily WHERE child_id = ? AND day >= ?')
      .all(childId, dayKey(new Date(startOfWeek(now).getTime() - 7 * 86400000))) as { day: string; seconds: number }[];
    const byDay = new Map(rows.map((r) => [r.day, r.seconds]));
    const week = days.map((d, i) => ({
      day: dayKey(d),
      label: DAY_LABELS[i],
      short: DAY_LABELS[i].slice(0, 3),
      minutes: Math.round((byDay.get(dayKey(d)) ?? 0) / 60),
      isFuture: d > now,
    }));
    const lastWeekMinutes = days.reduce((sum, d) => {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 7);
      return sum + Math.round((byDay.get(dayKey(prev)) ?? 0) / 60);
    }, 0);
    const totalMinutes = week.reduce((s, d) => s + d.minutes, 0);
    return { week, totalMinutes, lastWeekMinutes };
  }

  router.get('/children', (req, res) => {
    const children = db
      .prepare(
        `SELECT u.id, u.display_name AS name, u.avatar_id AS avatarId, u.age FROM users u
         JOIN family_links f ON f.child_id = u.id WHERE f.parent_id = ? ORDER BY u.display_name`,
      )
      .all(req.parentId) as { id: number; name: string; avatarId: number; age: number | null }[];
    const family = db.prepare('SELECT display_name AS name, username FROM users WHERE id = ?').get(req.parentId) as {
      name: string;
      username: string;
    };
    res.json({ family, children });
  });

  router.patch('/pin', (req, res) => {
    const body = z
      .object({
        currentPin: z.string().regex(/^\d{4}$/, 'El PIN actual tiene 4 números.'),
        newPin: z.string().regex(/^\d{4}$/, 'El PIN nuevo tiene 4 números.'),
      })
      .parse(req.body);
    const user = db.prepare('SELECT pin_hash FROM users WHERE id = ?').get(req.parentId) as { pin_hash: string };
    if (!bcrypt.compareSync(body.currentPin, user.pin_hash)) {
      throw new HttpError(400, 'El PIN actual no coincide.');
    }
    db.prepare('UPDATE users SET pin_hash = ? WHERE id = ?').run(bcrypt.hashSync(body.newPin, 10), req.parentId);
    res.json({ ok: true });
  });

  router.post('/support', (req, res) => {
    const { message } = z
      .object({ message: z.string().trim().min(5, 'Cuéntanos un poco más (mínimo 5 caracteres).').max(1000) })
      .parse(req.body);
    db.prepare('INSERT INTO support_messages (parent_id, message, created_at) VALUES (?, ?, ?)').run(
      req.parentId,
      message,
      new Date().toISOString(),
    );
    res.status(201).json({ ok: true });
  });

  router.get('/:childId/summary', (req, res) => {
    const childId = linkedChild(req);
    const since = startOfWeek().toISOString();
    const completed = (
      db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE child_id = ? AND completed = 1 AND finished_at >= ?').get(childId, since) as {
        n: number;
      }
    ).n;
    const newBadges = db
      .prepare(
        `SELECT b.title, b.icon FROM child_badges cb JOIN badges b ON b.id = cb.badge_id
         WHERE cb.child_id = ? AND cb.earned_at >= ? ORDER BY cb.earned_at`,
      )
      .all(childId, since) as { title: string; icon: string }[];
    const practiced = db
      .prepare(
        `SELECT m.skill, COUNT(*) AS n FROM attempts t JOIN activities a ON a.id = t.activity_id
         JOIN modules m ON m.id = a.module_id
         WHERE t.child_id = ? AND t.completed = 1 AND t.finished_at >= ? GROUP BY m.skill ORDER BY n DESC`,
      )
      .all(childId, since) as { skill: string; n: number }[];
    const help = db
      .prepare('SELECT id, context, created_at AS createdAt FROM help_requests WHERE child_id = ? AND seen = 0 ORDER BY created_at DESC')
      .all(childId) as { id: number; context: string; createdAt: string }[];
    const profile = childProfile(db, childId);
    res.json({
      child: { id: profile.id, name: profile.name, avatarId: profile.avatarId, age: profile.age },
      weekStart: since,
      completed,
      newBadges,
      usage: usageOf(childId),
      weekly: weeklyStatus(db, childId),
      level: { level: profile.level, levelName: profile.levelName, percent: profile.percent },
      practicedSkills: practiced.map((p) => SKILLS.find((s) => s.code === p.skill)?.title ?? p.skill),
      helpRequests: help,
    });
  });

  router.post('/:childId/help-requests/seen', (req, res) => {
    const childId = linkedChild(req);
    db.prepare('UPDATE help_requests SET seen = 1 WHERE child_id = ?').run(childId);
    res.json({ ok: true });
  });

  router.get('/:childId/skills', (req, res) => {
    res.json({ skills: skillsOf(linkedChild(req)) });
  });

  router.get('/:childId/activities', (req, res) => {
    const childId = linkedChild(req);
    const rows = db
      .prepare(
        `SELECT t.id, a.title, a.type, m.title AS moduleTitle, t.started_at AS startedAt, t.finished_at AS finishedAt,
                t.completed, t.stars, t.duration_sec AS durationSec
         FROM attempts t JOIN activities a ON a.id = t.activity_id JOIN modules m ON m.id = a.module_id
         WHERE t.child_id = ? ORDER BY COALESCE(t.finished_at, t.started_at) DESC LIMIT 60`,
      )
      .all(childId) as {
      id: number;
      title: string;
      type: string;
      moduleTitle: string;
      startedAt: string;
      finishedAt: string | null;
      completed: number;
      stars: number;
      durationSec: number;
    }[];
    res.json({ activities: rows.map((r) => ({ ...r, completed: Boolean(r.completed) })) });
  });

  router.get('/:childId/achievements', (req, res) => {
    const childId = linkedChild(req);
    const profile = childProfile(db, childId);
    res.json({
      ...rewardsFor(db, childId),
      level: levelProgress(profile.xp),
      mascot: profile.mascot,
      weekly: profile.weekly,
    });
  });

  router.get('/:childId/usage', (req, res) => {
    res.json(usageOf(linkedChild(req)));
  });

  router.get('/:childId/recommendations', (req, res) => {
    const skills = skillsOf(linkedChild(req));
    const ordered = [...skills].sort((a, b) => a.percent - b.percent || a.completed - b.completed);
    const pick = (skill: string, n: number) =>
      db.prepare('SELECT id, skill, title, body, minutes FROM recommendations WHERE skill = ? ORDER BY id LIMIT ?').all(skill, n) as {
        id: number;
        skill: string;
        title: string;
        body: string;
        minutes: number;
      }[];
    const recommendations = [...pick(ordered[0].code, 2), ...pick(ordered[1].code, 1)].map((r) => ({
      ...r,
      skillTitle: SKILLS.find((s) => s.code === r.skill)?.title,
    }));
    res.json({ focusSkill: ordered[0].title, recommendations });
  });

  router.patch('/:childId', (req, res) => {
    const childId = linkedChild(req);
    const body = z
      .object({
        displayName: z.string().trim().min(1, 'Escribe un nombre.').max(30),
        age: z.number().int().min(6).max(10).nullable(),
      })
      .parse(req.body);
    db.prepare('UPDATE users SET display_name = ?, age = ? WHERE id = ?').run(body.displayName, body.age, childId);
    res.json({ ok: true });
  });

  router.patch('/:childId/password', (req, res) => {
    const childId = linkedChild(req);
    const body = z
      .object({
        newPassword: z.string().trim().min(4, 'La clave necesita al menos 4 caracteres.').max(60).optional(),
        newPictures: z.array(z.enum(PICTURE_KEYS)).length(3).optional(),
      })
      .refine((v) => v.newPassword || v.newPictures, { message: 'Elige una clave nueva.' })
      .parse(req.body);
    if (body.newPassword) {
      db.prepare('UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?').run(
        bcrypt.hashSync(body.newPassword, 10),
        childId,
      );
    }
    if (body.newPictures) {
      db.prepare('UPDATE users SET picture_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?').run(
        bcrypt.hashSync(pictureKeyString(body.newPictures), 10),
        childId,
      );
    }
    res.json({ ok: true });
  });

  router.delete('/:childId', (req, res) => {
    const childId = linkedChild(req);
    db.prepare('DELETE FROM users WHERE id = ? AND role = ?').run(childId, 'nino');
    res.json({ ok: true });
  });

  router.post('/logout', (_req, res) => {
    clearSession(res, 'familia');
    res.json({ ok: true });
  });

  return router;
}
