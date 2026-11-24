import bcrypt from 'bcryptjs';
import type { DB } from '../db/index.js';
import { pictureKeyString } from '../lib/pictures.js';
import { normalizeAnswer } from '../lib/text.js';
import { dayKey, startOfWeek } from '../lib/time.js';
import { finishAttempt, startAttempt, submitAnswer } from '../services/attempts.js';
import { BADGES, EXPRESO_EMOTIONS, MODULES, RECOMMENDATIONS, STICKERS } from './content.js';

/** Usuarios ficticios de demostración (las credenciales están en el README, nunca en la interfaz). */
export const DEMO = {
  family: { username: 'rivera', name: 'Familia Rivera', pin: '2468', question: '¿Cómo se llamaba la primera mascota de la familia?', answer: 'Canela' },
  mateo: { name: 'Mateo', password: 'nubi123', pictures: ['nubi', 'estrella', 'alegria'], age: 8, avatar: 1 },
  sofia: { name: 'Sofía', password: 'luna45', pictures: ['alegria', 'familia', 'respira'], age: 6, avatar: 2 },
};

export function isSeeded(db: DB) {
  return (db.prepare('SELECT COUNT(*) AS n FROM modules').get() as { n: number }).n > 0;
}

export function seedContent(db: DB) {
  const insertModule = db.prepare(
    'INSERT INTO modules (code, title, world_title, skill, position, icon) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertActivity = db.prepare(
    `INSERT INTO activities (module_id, type, title, instruction, emotion_code, sticker_code, position, est_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertQuestion = db.prepare(
    `INSERT INTO questions (activity_id, position, prompt, story, scene_image, scene_alt, hint1, hint2, explanation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertOption = db.prepare(
    `INSERT INTO options (question_id, position, kind, label, emotion_code, image, feedback, is_correct)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  MODULES.forEach((module, mi) => {
    const moduleId = Number(
      insertModule.run(module.code, module.title, module.world, module.skill, mi + 1, module.icon).lastInsertRowid,
    );
    module.activities.forEach((activity, ai) => {
      const activityId = Number(
        insertActivity.run(
          moduleId,
          activity.type,
          activity.title,
          activity.instruction,
          activity.emotion ?? null,
          activity.sticker,
          ai + 1,
          activity.minutes,
        ).lastInsertRowid,
      );
      activity.questions.forEach((q, qi) => {
        const questionId = Number(
          insertQuestion.run(
            activityId,
            qi + 1,
            q.prompt,
            q.story ?? null,
            q.scene ?? null,
            q.sceneAlt ?? null,
            q.hint1 ?? null,
            q.hint2 ?? null,
            q.explanation,
          ).lastInsertRowid,
        );
        q.options?.forEach((o, oi) =>
          insertOption.run(questionId, oi + 1, 'choice', o.label, o.emotion ?? null, o.image ?? null, o.feedback ?? null, Number(Boolean(o.correct))),
        );
        q.pairs?.forEach((p, pi) => insertOption.run(questionId, pi + 1, 'pair', p.label, p.emotion, null, null, 1));
        if (q.reasons) {
          EXPRESO_EMOTIONS.forEach((e, ei) => insertOption.run(questionId, ei + 1, 'emotion', e.label, e.emotion!, e.image!, null, 1));
          q.reasons.forEach((r, ri) => insertOption.run(questionId, ri + 1, 'reason', r.label, null, r.image, null, 1));
        }
      });
    });
  });

  const insertBadge = db.prepare('INSERT INTO badges (code, title, condition_text, icon) VALUES (?, ?, ?, ?)');
  for (const b of BADGES) insertBadge.run(b.code, b.title, b.condition, b.icon);
  const insertSticker = db.prepare('INSERT INTO stickers (code, title, image) VALUES (?, ?, ?)');
  for (const s of STICKERS) insertSticker.run(s.code, s.title, s.image);
  const insertRec = db.prepare('INSERT INTO recommendations (skill, title, body, minutes) VALUES (?, ?, ?, ?)');
  for (const r of RECOMMENDATIONS) insertRec.run(r.skill, r.title, r.body, r.minutes);
}

function createChild(db: DB, child: typeof DEMO.mateo) {
  const id = Number(
    db
      .prepare(
        `INSERT INTO users (role, display_name, username, password_hash, picture_hash, avatar_id, age)
         VALUES ('nino', ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        child.name,
        normalizeAnswer(child.name),
        bcrypt.hashSync(child.password, 10),
        bcrypt.hashSync(pictureKeyString(child.pictures), 10),
        child.avatar,
        child.age,
      ).lastInsertRowid,
  );
  db.prepare('INSERT INTO child_progress (child_id) VALUES (?)').run(id);
  db.prepare('INSERT INTO preferences (child_id) VALUES (?)').run(id);
  return id;
}

interface OptionRow {
  id: number;
  kind: string;
  emotion_code: string | null;
  is_correct: number;
}

/** Juega una actividad completa con el mismo motor que usa la app. */
function playActivity(db: DB, childId: number, activityId: number, finishedAt: Date, mistakesOn: number[] = []) {
  const { attemptId } = startAttempt(db, childId, activityId);
  const startedAt = new Date(finishedAt.getTime() - 3 * 60000 - Math.round(Math.random() * 90000));
  db.prepare('UPDATE attempts SET started_at = ? WHERE id = ?').run(startedAt.toISOString(), attemptId);
  const type = (db.prepare('SELECT type FROM activities WHERE id = ?').get(activityId) as { type: string }).type;
  const questions = db.prepare('SELECT id FROM questions WHERE activity_id = ? ORDER BY position').all(activityId) as { id: number }[];

  questions.forEach((q, index) => {
    const options = db.prepare('SELECT id, kind, emotion_code, is_correct FROM options WHERE question_id = ?').all(q.id) as OptionRow[];
    const mistake = mistakesOn.includes(index);
    if (type === 'une') {
      const pairs = options.map((o) => ({ itemId: o.id, emotion: o.emotion_code! }));
      if (mistake) {
        const swapped = pairs.map((p, i) => ({ ...p, emotion: pairs[(i + 1) % pairs.length].emotion }));
        submitAnswer(db, childId, attemptId, { questionId: q.id, pairs: swapped });
      }
      submitAnswer(db, childId, attemptId, { questionId: q.id, pairs, hintsUsed: mistake ? 1 : 0 });
    } else if (type === 'expreso') {
      const emotion = options.find((o) => o.kind === 'emotion')!;
      const reason = options.find((o) => o.kind === 'reason')!;
      submitAnswer(db, childId, attemptId, { questionId: q.id, emotionOptionId: emotion.id, reasonOptionId: reason.id, intensity: 'algo' });
    } else {
      if (mistake) {
        const wrong = options.find((o) => !o.is_correct)!;
        submitAnswer(db, childId, attemptId, { questionId: q.id, optionId: wrong.id });
      }
      const right = options.find((o) => o.is_correct)!;
      submitAnswer(db, childId, attemptId, { questionId: q.id, optionId: right.id, hintsUsed: mistake ? 1 : 0 });
    }
  });
  db.prepare('UPDATE answers SET created_at = ? WHERE attempt_id = ?').run(finishedAt.toISOString(), attemptId);
  return finishAttempt(db, childId, attemptId, finishedAt);
}

const at = (base: Date, dayOffset: number, hour: number, minute: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export function seedDatabase(db: DB, now = new Date()) {
  db.transaction(() => {
    seedContent(db);

    const f = DEMO.family;
    const familyId = Number(
      db
        .prepare(
          `INSERT INTO users (role, display_name, username, pin_hash, security_question, security_answer_hash)
           VALUES ('familia', ?, ?, ?, ?, ?)`,
        )
        .run(f.name, f.username, bcrypt.hashSync(f.pin, 10), f.question, bcrypt.hashSync(normalizeAnswer(f.answer), 10))
        .lastInsertRowid,
    );
    const mateo = createChild(db, DEMO.mateo);
    const sofia = createChild(db, DEMO.sofia);
    db.prepare('INSERT INTO family_links (parent_id, child_id) VALUES (?, ?), (?, ?)').run(familyId, mateo, familyId, sofia);
    db.prepare('UPDATE child_progress SET tutorial_done = 1 WHERE child_id = ?').run(mateo);

    // Historial de Mateo: módulo 1 completo y dos actividades del módulo 2.
    const ids = (db.prepare('SELECT a.id FROM activities a JOIN modules m ON m.id = a.module_id ORDER BY m.position, a.position').all() as {
      id: number;
    }[]).map((r) => r.id);
    const monday = startOfWeek(now);
    const todayIndex = Math.round((at(now, 0, 0, 0).getTime() - monday.getTime()) / 86400000);
    const thisWeek = (slot: number, hour: number) => {
      const day = Math.min(todayIndex, slot);
      const date = at(monday, day, hour, 10 + slot * 7);
      return date > now ? new Date(now.getTime() - (6 - slot) * 20 * 60000) : date;
    };

    playActivity(db, mateo, ids[0], at(monday, -6, 17, 5));
    playActivity(db, mateo, ids[1], at(monday, -5, 16, 40), [1]);
    playActivity(db, mateo, ids[2], at(monday, -3, 18, 15));
    playActivity(db, mateo, ids[3], thisWeek(0, 16), [2]);
    playActivity(db, mateo, ids[4], thisWeek(1, 17), [0]);
    playActivity(db, mateo, ids[5], thisWeek(2, 16));
    playActivity(db, mateo, ids[6], thisWeek(3, 18));

    // Tiempo de uso por día (semana pasada y esta semana hasta hoy).
    const insertUsage = db.prepare('INSERT INTO usage_daily (child_id, day, seconds) VALUES (?, ?, ?)');
    const lastWeek = [14, 10, 0, 22, 12, 8, 0];
    const current = [18, 12, 25, 15, 20, 10, 6];
    lastWeek.forEach((min, i) => min && insertUsage.run(mateo, dayKey(at(monday, i - 7, 12, 0)), min * 60));
    current.forEach((min, i) => {
      if (i <= todayIndex && min) insertUsage.run(mateo, dayKey(at(monday, i, 12, 0)), min * 60);
    });
  })();
}
