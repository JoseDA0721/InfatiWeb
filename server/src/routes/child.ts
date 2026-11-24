import { Router } from 'express';
import { z } from 'zod';
import type { DB } from '../db/index.js';
import { notFound } from '../lib/http.js';
import { dayKey } from '../lib/time.js';
import { requireChild } from '../middleware/auth.js';
import { finishAttempt, publicActivity, startAttempt, submitAnswer } from '../services/attempts.js';
import { buildMap, childProfile, lastActivity, rewardsFor } from '../services/progress.js';

const preferencesSchema = z.object({
  fontScale: z.enum(['normal', 'grande', 'muy_grande']),
  highContrast: z.boolean(),
  volume: z.number().min(0).max(1),
  muted: z.boolean(),
  voiceRate: z.number().min(0.5).max(1.5),
  readMode: z.enum(['texto', 'audio', 'ambos']),
  reduceMotion: z.boolean(),
});

const answerSchema = z.object({
  questionId: z.number().int().positive(),
  hintsUsed: z.number().int().min(0).max(2).optional(),
  optionId: z.number().int().positive().optional(),
  pairs: z.array(z.object({ itemId: z.number().int().positive(), emotion: z.string().max(20) })).max(6).optional(),
  emotionOptionId: z.number().int().positive().optional(),
  reasonOptionId: z.number().int().positive().optional(),
  intensity: z.enum(['poquito', 'algo', 'mucho']).optional(),
});

const idParam = (value: unknown) => z.coerce.number().int().positive().parse(value);

function readPreferences(db: DB, childId: number) {
  const row = db.prepare('SELECT * FROM preferences WHERE child_id = ?').get(childId) as
    | {
        font_scale: 'normal' | 'grande' | 'muy_grande';
        high_contrast: number;
        volume: number;
        muted: number;
        voice_rate: number;
        read_mode: 'texto' | 'audio' | 'ambos';
        reduce_motion: number;
      }
    | undefined;
  if (!row) throw notFound('Tus ajustes');
  return {
    fontScale: row.font_scale,
    highContrast: Boolean(row.high_contrast),
    volume: row.volume,
    muted: Boolean(row.muted),
    voiceRate: row.voice_rate,
    readMode: row.read_mode,
    reduceMotion: Boolean(row.reduce_motion),
  };
}

export function childRouter(db: DB) {
  const router = Router();
  // Solo las rutas del niño piden sesión; una ruta desconocida sigue dando 404.
  const childPaths = /^\/(me|home|map|activities|attempts|rewards|help-requests|usage)(\/|$)/;
  router.use((req, res, next) => (childPaths.test(req.path) ? requireChild(req, res, next) : next()));

  router.get('/me', (req, res) => {
    res.json(childProfile(db, req.childId!));
  });

  router.patch('/me/avatar', (req, res) => {
    const { avatarId } = z.object({ avatarId: z.number().int().min(1).max(3) }).parse(req.body);
    db.prepare('UPDATE users SET avatar_id = ? WHERE id = ?').run(avatarId, req.childId);
    res.json({ avatarId });
  });

  router.post('/me/tutorial', (req, res) => {
    db.prepare('UPDATE child_progress SET tutorial_done = 1 WHERE child_id = ?').run(req.childId);
    res.json({ tutorialDone: true });
  });

  router.get('/me/preferences', (req, res) => {
    res.json(readPreferences(db, req.childId!));
  });

  router.put('/me/preferences', (req, res) => {
    const p = preferencesSchema.parse(req.body);
    db.prepare(
      `UPDATE preferences SET font_scale = ?, high_contrast = ?, volume = ?, muted = ?, voice_rate = ?,
       read_mode = ?, reduce_motion = ? WHERE child_id = ?`,
    ).run(p.fontScale, Number(p.highContrast), p.volume, Number(p.muted), p.voiceRate, p.readMode, Number(p.reduceMotion), req.childId);
    res.json(readPreferences(db, req.childId!));
  });

  router.get('/home', (req, res) => {
    const childId = req.childId!;
    const map = buildMap(db, childId);
    const currentModule = map.current ? map.modules.find((m) => m.id === map.current!.moduleId) : undefined;
    const currentActivity = currentModule?.activities.find((a) => a.id === map.current!.activityId);
    res.json({
      profile: childProfile(db, childId),
      continue:
        currentModule && currentActivity
          ? {
              moduleId: currentModule.id,
              moduleTitle: currentModule.title,
              activityId: currentActivity.id,
              activityTitle: currentActivity.title,
              inProgress: currentActivity.status === 'en_curso',
            }
          : null,
      last: lastActivity(db, childId),
      modules: map.modules.map(({ activities: _a, ...m }) => m),
      pendingHelp: (
        db.prepare('SELECT COUNT(*) AS n FROM help_requests WHERE child_id = ? AND seen = 0').get(childId) as { n: number }
      ).n,
    });
  });

  router.get('/map', (req, res) => {
    res.json(buildMap(db, req.childId!));
  });

  router.get('/activities/:id', (req, res) => {
    res.json(publicActivity(db, idParam(req.params.id), req.childId!));
  });

  router.post('/attempts', (req, res) => {
    const { activityId } = z.object({ activityId: z.number().int().positive() }).parse(req.body);
    res.status(201).json(startAttempt(db, req.childId!, activityId));
  });

  router.post('/attempts/:id/answers', (req, res) => {
    res.json(submitAnswer(db, req.childId!, idParam(req.params.id), answerSchema.parse(req.body)));
  });

  router.post('/attempts/:id/finish', (req, res) => {
    res.json(finishAttempt(db, req.childId!, idParam(req.params.id)));
  });

  router.get('/rewards', (req, res) => {
    const profile = childProfile(db, req.childId!);
    res.json({ ...rewardsFor(db, req.childId!), level: profile, mascot: profile.mascot, weekly: profile.weekly });
  });

  router.post('/help-requests', (req, res) => {
    const { context } = z.object({ context: z.string().trim().max(120).default('Ayuda') }).parse(req.body ?? {});
    db.prepare('INSERT INTO help_requests (child_id, context, created_at) VALUES (?, ?, ?)').run(
      req.childId,
      context,
      new Date().toISOString(),
    );
    res.status(201).json({ ok: true });
  });

  router.post('/usage/heartbeat', (req, res) => {
    const { seconds } = z.object({ seconds: z.number().int().min(1).max(60) }).parse(req.body);
    db.prepare(
      `INSERT INTO usage_daily (child_id, day, seconds) VALUES (?, ?, ?)
       ON CONFLICT (child_id, day) DO UPDATE SET seconds = seconds + excluded.seconds`,
    ).run(req.childId, dayKey(new Date()), seconds);
    res.json({ ok: true });
  });

  return router;
}
