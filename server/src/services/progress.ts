import type { DB } from '../db/index.js';
import { dayKey, startOfWeek, weekDays } from '../lib/time.js';
import { DEFAULT_WEEKLY_GOAL, levelProgress, mascotStage } from './gamification.js';

export type ActivityStatus = 'bloqueada' | 'nueva' | 'en_curso' | 'completada';

interface ModuleRow {
  id: number;
  code: string;
  title: string;
  world_title: string;
  skill: string;
  position: number;
  icon: string;
}

interface ActivityRow {
  id: number;
  module_id: number;
  type: string;
  title: string;
  instruction: string;
  emotion_code: string | null;
  sticker_code: string | null;
  position: number;
  est_minutes: number;
  question_count: number;
}

export const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  identifica: 'Identifica la emoción',
  une: 'Une las emociones',
  que_harias: '¿Qué harías?',
  respira: 'Respira conmigo',
  expreso: 'Expreso lo que siento',
  observa: 'Observa la expresión',
  escucha: 'Escucha y responde',
};

export function listModules(db: DB) {
  return db.prepare('SELECT * FROM modules ORDER BY position').all() as ModuleRow[];
}

export function listActivities(db: DB) {
  return db
    .prepare(
      `SELECT a.*, (SELECT COUNT(*) FROM questions q WHERE q.activity_id = a.id) AS question_count
       FROM activities a JOIN modules m ON m.id = a.module_id
       ORDER BY m.position, a.position`,
    )
    .all() as ActivityRow[];
}

/** Estado de cada módulo y actividad para un niño: desbloqueo secuencial y mejores estrellas. */
export function buildMap(db: DB, childId: number) {
  const modules = listModules(db);
  const activities = listActivities(db);
  const best = new Map<number, number>();
  for (const row of db
    .prepare('SELECT activity_id, MAX(stars) AS stars FROM attempts WHERE child_id = ? AND completed = 1 GROUP BY activity_id')
    .all(childId) as { activity_id: number; stars: number }[]) {
    best.set(row.activity_id, row.stars);
  }
  const open = new Map<number, number>();
  for (const row of db
    .prepare('SELECT activity_id, MAX(id) AS id FROM attempts WHERE child_id = ? AND completed = 0 GROUP BY activity_id')
    .all(childId) as { activity_id: number; id: number }[]) {
    open.set(row.activity_id, row.id);
  }

  let previousModuleComplete = true;
  let current: { activityId: number; moduleId: number } | null = null;

  const result = modules.map((module) => {
    const moduleUnlocked = previousModuleComplete;
    let previousDone = true;
    const items = activities
      .filter((a) => a.module_id === module.id)
      .map((a) => {
        const completed = best.has(a.id);
        const unlocked = moduleUnlocked && (previousDone || completed);
        let status: ActivityStatus = 'bloqueada';
        if (completed) status = 'completada';
        else if (unlocked && open.has(a.id)) status = 'en_curso';
        else if (unlocked) status = 'nueva';
        previousDone = completed;
        if (!current && unlocked && !completed) current = { activityId: a.id, moduleId: module.id };
        return {
          id: a.id,
          title: a.title,
          type: a.type,
          typeLabel: ACTIVITY_TYPE_LABEL[a.type],
          instruction: a.instruction,
          position: a.position,
          estMinutes: a.est_minutes,
          questionCount: a.question_count,
          emotion: a.emotion_code,
          status,
          stars: best.get(a.id) ?? 0,
        };
      });
    const completedCount = items.filter((i) => i.status === 'completada').length;
    const complete = completedCount === items.length && items.length > 0;
    previousModuleComplete = complete;
    return {
      id: module.id,
      code: module.code,
      title: module.title,
      worldTitle: module.world_title,
      skill: module.skill,
      position: module.position,
      icon: module.icon,
      unlocked: moduleUnlocked,
      complete,
      completedCount,
      total: items.length,
      starsEarned: items.reduce((sum, i) => sum + i.stars, 0),
      starsPossible: items.length * 3,
      activities: items,
    };
  });

  return { modules: result, current: current as { activityId: number; moduleId: number } | null };
}

export function weeklyStatus(db: DB, childId: number, now = new Date()) {
  const goal =
    (db.prepare('SELECT weekly_goal FROM child_progress WHERE child_id = ?').get(childId) as { weekly_goal: number } | undefined)
      ?.weekly_goal ?? DEFAULT_WEEKLY_GOAL;
  const since = startOfWeek(now).toISOString();
  const rows = db
    .prepare('SELECT finished_at FROM attempts WHERE child_id = ? AND completed = 1 AND finished_at >= ?')
    .all(childId, since) as { finished_at: string }[];
  const activeDays = new Set(rows.map((r) => dayKey(new Date(r.finished_at))));
  const labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const today = dayKey(now);
  return {
    goal,
    completed: rows.length,
    reached: rows.length >= goal,
    days: weekDays(now).map((d, i) => ({
      key: dayKey(d),
      label: labels[i],
      short: labels[i][0],
      played: activeDays.has(dayKey(d)),
      isToday: dayKey(d) === today,
    })),
  };
}

export function childProfile(db: DB, childId: number) {
  const row = db
    .prepare(
      `SELECT u.id, u.display_name AS name, u.avatar_id AS avatarId, u.age, p.xp, p.tutorial_done AS tutorialDone
       FROM users u JOIN child_progress p ON p.child_id = u.id WHERE u.id = ?`,
    )
    .get(childId) as { id: number; name: string; avatarId: number; age: number | null; xp: number; tutorialDone: number };
  const progress = levelProgress(row.xp);
  return {
    id: row.id,
    name: row.name,
    avatarId: row.avatarId,
    age: row.age,
    tutorialDone: Boolean(row.tutorialDone),
    ...progress,
    mascot: mascotStage(progress.level),
    weekly: weeklyStatus(db, childId),
  };
}

export function lastActivity(db: DB, childId: number) {
  return (
    (db
      .prepare(
        `SELECT a.id AS activityId, a.title, a.type, t.stars, t.finished_at AS finishedAt, m.title AS moduleTitle
         FROM attempts t JOIN activities a ON a.id = t.activity_id JOIN modules m ON m.id = a.module_id
         WHERE t.child_id = ? AND t.completed = 1 ORDER BY t.finished_at DESC LIMIT 1`,
      )
      .get(childId) as
      | { activityId: number; title: string; type: string; stars: number; finishedAt: string; moduleTitle: string }
      | undefined) ?? null
  );
}

interface BadgeRow {
  id: number;
  code: string;
  title: string;
  condition_text: string;
  icon: string;
}

/** Cuenta aciertos por emoción (opciones correctas y parejas bien unidas). */
export function correctByEmotion(db: DB, childId: number) {
  const counts: Record<string, number> = {};
  const choice = db
    .prepare(
      `SELECT o.emotion_code AS emotion, COUNT(*) AS n FROM answers ans
       JOIN attempts t ON t.id = ans.attempt_id JOIN options o ON o.id = ans.option_id
       WHERE t.child_id = ? AND ans.is_correct = 1 AND o.emotion_code IS NOT NULL AND o.kind = 'choice'
       GROUP BY o.emotion_code`,
    )
    .all(childId) as { emotion: string; n: number }[];
  for (const row of choice) counts[row.emotion] = (counts[row.emotion] ?? 0) + row.n;
  const pairs = db
    .prepare(
      `SELECT ans.detail FROM answers ans JOIN attempts t ON t.id = ans.attempt_id
       JOIN activities a ON a.id = t.activity_id
       WHERE t.child_id = ? AND ans.is_correct = 1 AND a.type = 'une' AND ans.detail IS NOT NULL`,
    )
    .all(childId) as { detail: string }[];
  for (const row of pairs) {
    const detail = JSON.parse(row.detail) as { pairs?: { emotion: string }[] };
    for (const pair of detail.pairs ?? []) counts[pair.emotion] = (counts[pair.emotion] ?? 0) + 1;
  }
  return counts;
}

/** Revisa todas las condiciones de insignias y entrega las nuevas. Devuelve las ganadas ahora. */
export function awardBadges(db: DB, childId: number, at = new Date().toISOString()) {
  const badges = db.prepare('SELECT * FROM badges ORDER BY id').all() as BadgeRow[];
  const owned = new Set(
    (db.prepare('SELECT badge_id FROM child_badges WHERE child_id = ?').all(childId) as { badge_id: number }[]).map(
      (r) => r.badge_id,
    ),
  );
  const completedCount = (
    db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE child_id = ? AND completed = 1').get(childId) as { n: number }
  ).n;
  const calm = db
    .prepare(
      `SELECT 1 FROM attempts t JOIN activities a ON a.id = t.activity_id
       WHERE t.child_id = ? AND t.completed = 1 AND a.type = 'respira' LIMIT 1`,
    )
    .get(childId);
  const brave = db
    .prepare(
      `SELECT 1 FROM attempts t JOIN answers ans ON ans.attempt_id = t.id
       WHERE t.child_id = ? AND t.completed = 1 AND (ans.is_correct = 0 OR ans.hints_used > 0) LIMIT 1`,
    )
    .get(childId);
  const weekly = weeklyStatus(db, childId, new Date(at));
  const byEmotion = correctByEmotion(db, childId);

  const earned: BadgeRow[] = [];
  for (const badge of badges) {
    if (owned.has(badge.id)) continue;
    let ok = false;
    if (badge.code === 'primer_paso') ok = completedCount >= 1;
    else if (badge.code === 'calma') ok = Boolean(calm);
    else if (badge.code === 'valiente') ok = Boolean(brave);
    else if (badge.code === 'constancia') ok = weekly.reached;
    else if (badge.code.startsWith('detective_')) ok = (byEmotion[badge.code.replace('detective_', '')] ?? 0) >= 3;
    if (ok) {
      db.prepare('INSERT INTO child_badges (child_id, badge_id, earned_at) VALUES (?, ?, ?)').run(childId, badge.id, at);
      earned.push(badge);
    }
  }
  return earned.map((b) => ({ code: b.code, title: b.title, condition: b.condition_text, icon: b.icon }));
}

export function rewardsFor(db: DB, childId: number) {
  const badges = (
    db
      .prepare(
        `SELECT b.code, b.title, b.condition_text AS condition, b.icon, cb.earned_at AS earnedAt
         FROM badges b LEFT JOIN child_badges cb ON cb.badge_id = b.id AND cb.child_id = ?
         ORDER BY (cb.earned_at IS NULL), cb.earned_at, b.id`,
      )
      .all(childId) as { code: string; title: string; condition: string; icon: string; earnedAt: string | null }[]
  ).map((b) => ({ ...b, earned: Boolean(b.earnedAt) }));
  const stickers = (
    db
      .prepare(
        `SELECT s.code, s.title, s.image, cs.earned_at AS earnedAt,
                (SELECT a.title FROM activities a WHERE a.sticker_code = s.code LIMIT 1) AS fromActivity
         FROM stickers s LEFT JOIN child_stickers cs ON cs.sticker_id = s.id AND cs.child_id = ?
         ORDER BY s.id`,
      )
      .all(childId) as { code: string; title: string; image: string; earnedAt: string | null; fromActivity: string | null }[]
  ).map((s) => ({ ...s, earned: Boolean(s.earnedAt) }));
  return { badges, stickers };
}
