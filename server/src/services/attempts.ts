import type { DB } from '../db/index.js';
import { HttpError, notFound } from '../lib/http.js';
import { activityStars, helpAfterFailure, levelProgress, mascotStage, starsForQuestion, xpForAttempt } from './gamification.js';
import { ACTIVITY_TYPE_LABEL, awardBadges, buildMap, weeklyStatus } from './progress.js';

interface QuestionRow {
  id: number;
  activity_id: number;
  position: number;
  prompt: string;
  story: string | null;
  scene_image: string | null;
  scene_alt: string | null;
  hint1: string | null;
  hint2: string | null;
  explanation: string | null;
}

interface OptionRow {
  id: number;
  question_id: number;
  position: number;
  kind: 'choice' | 'pair' | 'emotion' | 'reason';
  label: string;
  emotion_code: string | null;
  image: string | null;
  feedback: string | null;
  is_correct: number;
}

interface AttemptRow {
  id: number;
  child_id: number;
  activity_id: number;
  started_at: string;
  finished_at: string | null;
  completed: number;
}

interface AnswerRow {
  question_id: number;
  is_correct: number;
  revealed: number;
  stars: number;
  hints_used: number;
  try_number: number;
}

export const EMOTION_LABEL: Record<string, string> = {
  alegria: 'Alegría',
  tristeza: 'Tristeza',
  enojo: 'Enojo',
  miedo: 'Miedo',
  sorpresa: 'Sorpresa',
};

export const INTENSITY_LABEL = { poquito: 'Un poquito', algo: 'Algo', mucho: 'Mucho' } as const;
export type Intensity = keyof typeof INTENSITY_LABEL;

const FEMININE = new Set(['alegria', 'tristeza', 'sorpresa']);

/** «Siento mucha alegría porque…»: concordancia de género según la emoción. */
export function expressionSentence(emotion: string, intensity: Intensity, reason: string) {
  const noun = (EMOTION_LABEL[emotion] ?? emotion).toLowerCase();
  const amount =
    intensity === 'poquito' ? 'un poquito de' : intensity === 'algo' ? 'algo de' : FEMININE.has(emotion) ? 'mucha' : 'mucho';
  return `Siento ${amount} ${noun} porque ${reason.charAt(0).toLowerCase()}${reason.slice(1)}.`;
}

const questionsOf = (db: DB, activityId: number) =>
  db.prepare('SELECT * FROM questions WHERE activity_id = ? ORDER BY position').all(activityId) as QuestionRow[];

const optionsOf = (db: DB, questionId: number) =>
  db.prepare('SELECT * FROM options WHERE question_id = ? ORDER BY position, id').all(questionId) as OptionRow[];

function activityRow(db: DB, activityId: number) {
  const row = db
    .prepare(
      `SELECT a.*, m.title AS module_title, m.id AS module_id FROM activities a
       JOIN modules m ON m.id = a.module_id WHERE a.id = ?`,
    )
    .get(activityId) as
    | {
        id: number;
        module_id: number;
        module_title: string;
        type: string;
        title: string;
        instruction: string;
        emotion_code: string | null;
        est_minutes: number;
        sticker_code: string | null;
      }
    | undefined;
  if (!row) throw notFound('Esa actividad');
  return row;
}

/** Comprueba que la actividad esté desbloqueada para este niño. */
function assertUnlocked(db: DB, childId: number, activityId: number) {
  const { modules } = buildMap(db, childId);
  const activity = modules.flatMap((m) => m.activities).find((a) => a.id === activityId);
  if (!activity) throw notFound('Esa actividad');
  if (activity.status === 'bloqueada') {
    throw new HttpError(403, 'Esta actividad se abre cuando completes la anterior.', 'locked_activity');
  }
}

/** Actividad lista para jugar: nunca incluye cuál es la respuesta correcta. */
export function publicActivity(db: DB, activityId: number, childId: number) {
  const activity = activityRow(db, activityId);
  assertUnlocked(db, childId, activityId);
  const questions = questionsOf(db, activityId).map((q) => {
    const options = optionsOf(db, q.id);
    const base = {
      id: q.id,
      position: q.position,
      prompt: q.prompt,
      story: q.story,
      scene: q.scene_image,
      sceneAlt: q.scene_alt,
      hint1: q.hint1,
      hint2: q.hint2,
    };
    if (activity.type === 'une') {
      const emotions = [...new Set(options.map((o) => o.emotion_code!))].sort();
      return {
        ...base,
        items: options.map((o) => ({ id: o.id, label: o.label, image: o.image })),
        emotions: emotions.map((code) => ({ code, label: EMOTION_LABEL[code] })),
      };
    }
    if (activity.type === 'expreso') {
      return {
        ...base,
        emotions: options
          .filter((o) => o.kind === 'emotion')
          .map((o) => ({ id: o.id, code: o.emotion_code, label: o.label, image: o.image })),
        reasons: options.filter((o) => o.kind === 'reason').map((o) => ({ id: o.id, label: o.label, image: o.image })),
      };
    }
    return {
      ...base,
      options: options.map((o) => ({ id: o.id, label: o.label, emotion: o.emotion_code, image: o.image })),
    };
  });
  return {
    id: activity.id,
    moduleId: activity.module_id,
    moduleTitle: activity.module_title,
    type: activity.type,
    typeLabel: ACTIVITY_TYPE_LABEL[activity.type],
    title: activity.title,
    instruction: activity.instruction,
    emotion: activity.emotion_code,
    estMinutes: activity.est_minutes,
    questions,
  };
}

function attemptFor(db: DB, attemptId: number, childId: number) {
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId) as AttemptRow | undefined;
  if (!attempt || attempt.child_id !== childId) throw notFound('Ese intento');
  return attempt;
}

function answersOf(db: DB, attemptId: number) {
  return db
    .prepare('SELECT question_id, is_correct, revealed, stars, hints_used, try_number FROM answers WHERE attempt_id = ? ORDER BY id')
    .all(attemptId) as AnswerRow[];
}

/** Estado de cada pregunta dentro de un intento. */
function questionStates(db: DB, attemptId: number) {
  const states = new Map<number, { tries: number; failures: number; hints: number; resolved: boolean; stars: number }>();
  for (const a of answersOf(db, attemptId)) {
    const s = states.get(a.question_id) ?? { tries: 0, failures: 0, hints: 0, resolved: false, stars: 0 };
    s.tries = Math.max(s.tries, a.try_number);
    s.hints = Math.max(s.hints, a.hints_used);
    if (!a.is_correct && !a.revealed) s.failures += 1;
    if (a.is_correct || a.revealed) {
      s.resolved = true;
      s.stars = a.stars;
    }
    states.set(a.question_id, s);
  }
  return states;
}

/** Inicia un intento o retoma el que quedó abierto (el progreso se guarda). */
export function startAttempt(db: DB, childId: number, activityId: number) {
  activityRow(db, activityId);
  assertUnlocked(db, childId, activityId);
  const open = db
    .prepare('SELECT * FROM attempts WHERE child_id = ? AND activity_id = ? AND completed = 0 ORDER BY id DESC LIMIT 1')
    .get(childId, activityId) as AttemptRow | undefined;
  const attemptId =
    open?.id ??
    Number(
      db
        .prepare('INSERT INTO attempts (child_id, activity_id, started_at) VALUES (?, ?, ?)')
        .run(childId, activityId, new Date().toISOString()).lastInsertRowid,
    );
  const states = questionStates(db, attemptId);
  const resolved = [...states.entries()]
    .filter(([, s]) => s.resolved)
    .map(([questionId, s]) => ({ questionId, stars: s.stars }));
  return { attemptId, resumed: Boolean(open && resolved.length > 0), resolved };
}

export interface AnswerInput {
  questionId: number;
  hintsUsed?: number;
  optionId?: number;
  pairs?: { itemId: number; emotion: string }[];
  emotionOptionId?: number;
  reasonOptionId?: number;
  intensity?: Intensity;
}

export function submitAnswer(db: DB, childId: number, attemptId: number, input: AnswerInput) {
  const attempt = attemptFor(db, attemptId, childId);
  if (attempt.completed) throw new HttpError(409, 'Esta actividad ya terminó. Puedes jugarla otra vez desde el mapa.');
  const activity = activityRow(db, attempt.activity_id);
  const question = db
    .prepare('SELECT * FROM questions WHERE id = ? AND activity_id = ?')
    .get(input.questionId, attempt.activity_id) as QuestionRow | undefined;
  if (!question) throw notFound('Esa pregunta');

  const state = questionStates(db, attemptId).get(question.id) ?? {
    tries: 0,
    failures: 0,
    hints: 0,
    resolved: false,
    stars: 0,
  };
  if (state.resolved) throw new HttpError(409, 'Ya respondiste esta pregunta. ¡Sigue con la próxima!');

  const options = optionsOf(db, question.id);
  const tryNumber = state.tries + 1;
  const hintsUsed = Math.min(2, Math.max(state.hints, input.hintsUsed ?? 0));
  const insert = db.prepare(
    `INSERT INTO answers (attempt_id, question_id, option_id, is_correct, try_number, hints_used, revealed, stars, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  let correct = false;
  let optionId: number | null = null;
  let detail: Record<string, unknown> | null = null;
  let feedbackText: string | null = null;
  let pairResults: { itemId: number; correct: boolean }[] | undefined;

  if (activity.type === 'une') {
    const items = options.filter((o) => o.kind === 'pair');
    const pairs = input.pairs ?? [];
    if (pairs.length !== items.length) throw new HttpError(400, 'Une todas las situaciones antes de comprobar.');
    pairResults = items.map((item) => ({
      itemId: item.id,
      correct: pairs.find((p) => p.itemId === item.id)?.emotion === item.emotion_code,
    }));
    correct = pairResults.every((p) => p.correct);
    detail = { pairs: items.map((i) => ({ itemId: i.id, emotion: i.emotion_code })) };
    if (!correct) detail = { pairs: pairs.map((p) => ({ itemId: p.itemId, emotion: p.emotion })) };
  } else if (activity.type === 'expreso') {
    const emotion = options.find((o) => o.id === input.emotionOptionId && o.kind === 'emotion');
    const reason = options.find((o) => o.id === input.reasonOptionId && o.kind === 'reason');
    if (!emotion || !reason || !input.intensity) {
      throw new HttpError(400, 'Elige cómo te sientes, por qué y cuánto.');
    }
    correct = true; // Sin evaluación: expresar siempre está bien.
    optionId = emotion.id;
    detail = { emotion: emotion.emotion_code, reason: reason.label, intensity: input.intensity };
    feedbackText = expressionSentence(emotion.emotion_code!, input.intensity, reason.label);
  } else {
    const option = options.find((o) => o.id === input.optionId);
    if (!option) throw new HttpError(400, 'Elige una respuesta antes de comprobar.');
    optionId = option.id;
    correct = Boolean(option.is_correct);
    feedbackText = option.feedback;
  }

  if (correct) {
    const stars = activity.type === 'expreso' ? 3 : starsForQuestion({ tries: tryNumber, hintsUsed, revealed: false });
    insert.run(attemptId, question.id, optionId, 1, tryNumber, hintsUsed, 0, stars, detail && JSON.stringify(detail));
    return {
      correct: true,
      resolved: true,
      stars,
      persevered: tryNumber > 1,
      title: activity.type === 'expreso' ? '¡Gracias por contarlo!' : tryNumber > 1 ? '¡Qué bien que lo intentaste otra vez!' : '¡Muy bien!',
      message: feedbackText && activity.type !== 'que_harias' ? feedbackText : question.explanation,
      strategy: activity.type === 'que_harias' ? feedbackText : null,
      pairResults,
    };
  }

  const failures = state.failures + 1;
  const help = helpAfterFailure(failures);
  if (help === 'reveal') {
    insert.run(attemptId, question.id, optionId, 0, tryNumber, hintsUsed, 0, 0, detail && JSON.stringify(detail));
    insert.run(attemptId, question.id, null, 0, tryNumber, 2, 1, 1, null);
    const correctOptions = options.filter((o) => o.is_correct).map((o) => o.id);
    return {
      correct: false,
      resolved: true,
      stars: 1,
      revealed: true,
      title: 'Lo vemos juntos',
      message: question.explanation,
      strategy: feedbackText,
      correctOptionIds: activity.type === 'une' ? undefined : correctOptions,
      correctPairs:
        activity.type === 'une'
          ? options.filter((o) => o.kind === 'pair').map((o) => ({ itemId: o.id, emotion: o.emotion_code }))
          : undefined,
      askForHelp: 'Si algo no queda claro, puedes pedir ayuda a un adulto con el botón Ayuda.',
      pairResults,
    };
  }

  insert.run(attemptId, question.id, optionId, 0, tryNumber, hintsUsed, 0, 0, detail && JSON.stringify(detail));
  return {
    correct: false,
    resolved: false,
    title: activity.type === 'que_harias' ? 'Pensemos en otra idea' : '¡Casi! Inténtalo otra vez, tú puedes',
    message: activity.type === 'que_harias' ? feedbackText : null,
    hintLevel: help === 'hint1' ? 1 : 2,
    hint: help === 'hint1' ? question.hint1 : question.hint2,
    pairResults,
  };
}

/** Cierra el intento y calcula estrellas, XP, nivel, insignias, stickers, meta y desbloqueos. */
export function finishAttempt(db: DB, childId: number, attemptId: number, now = new Date()) {
  const attempt = attemptFor(db, attemptId, childId);
  if (attempt.completed) throw new HttpError(409, 'Esta actividad ya está cerrada.');
  const activity = activityRow(db, attempt.activity_id);
  const questions = questionsOf(db, attempt.activity_id);
  const states = questionStates(db, attemptId);
  const pending = questions.filter((q) => !states.get(q.id)?.resolved);
  if (pending.length > 0) throw new HttpError(409, 'Todavía quedan preguntas por responder.', 'pending_questions');

  const questionStars = questions.map((q) => states.get(q.id)!.stars);
  const stars = activityStars(questionStars);
  const persevered = [...states.values()].some((s) => s.failures > 0 || s.tries > 1);

  const before = buildMap(db, childId);
  const moduleBefore = before.modules.find((m) => m.id === activity.module_id)!;
  const wasModuleComplete = moduleBefore.complete;
  const prevProgress = db.prepare('SELECT xp FROM child_progress WHERE child_id = ?').get(childId) as { xp: number };
  const prevLevel = levelProgress(prevProgress.xp);
  const finishedAt = now.toISOString();
  const durationSec = Math.min(1800, Math.max(10, Math.round((now.getTime() - new Date(attempt.started_at).getTime()) / 1000)));

  const result = db.transaction(() => {
    db.prepare('UPDATE attempts SET completed = 1, finished_at = ?, stars = ?, duration_sec = ? WHERE id = ?').run(
      finishedAt,
      stars,
      durationSec,
      attemptId,
    );
    const after = buildMap(db, childId);
    const moduleAfter = after.modules.find((m) => m.id === activity.module_id)!;
    const moduleCompletedNow = !wasModuleComplete && moduleAfter.complete;
    const xp = xpForAttempt({ questionStars, activityType: activity.type, persevered, moduleCompletedNow });
    db.prepare('UPDATE attempts SET xp_earned = ? WHERE id = ?').run(xp.total, attemptId);
    const newXp = prevProgress.xp + xp.total;
    const progress = levelProgress(newXp);
    db.prepare('UPDATE child_progress SET xp = ?, level = ? WHERE child_id = ?').run(newXp, progress.level, childId);

    let sticker: { code: string; title: string; image: string } | null = null;
    if (activity.sticker_code) {
      const row = db.prepare('SELECT id, code, title, image FROM stickers WHERE code = ?').get(activity.sticker_code) as
        | { id: number; code: string; title: string; image: string }
        | undefined;
      if (row) {
        const inserted = db
          .prepare('INSERT OR IGNORE INTO child_stickers (child_id, sticker_id, earned_at) VALUES (?, ?, ?)')
          .run(childId, row.id, finishedAt);
        if (inserted.changes > 0) sticker = { code: row.code, title: row.title, image: row.image };
      }
    }

    const badges = awardBadges(db, childId, finishedAt);
    const nextModule = moduleCompletedNow ? after.modules.find((m) => m.position === moduleAfter.position + 1) : undefined;
    const nextInModule = moduleAfter.activities.find((a) => a.status !== 'completada' && a.status !== 'bloqueada');
    const next = after.current
      ? after.modules.flatMap((m) => m.activities).find((a) => a.id === after.current!.activityId)
      : undefined;

    return {
      activityId: activity.id,
      activityTitle: activity.title,
      stars,
      questionStars,
      xp,
      level: progress,
      levelUp: progress.level > prevLevel.level,
      mascot: mascotStage(progress.level),
      mascotEvolved: mascotStage(progress.level).stage > mascotStage(prevLevel.level).stage,
      badges,
      sticker,
      weekly: weeklyStatus(db, childId, now),
      moduleCompleted: moduleCompletedNow ? { id: moduleAfter.id, title: moduleAfter.title } : null,
      unlockedModule: nextModule ? { id: nextModule.id, title: nextModule.title } : null,
      next: next ? { id: next.id, title: next.title } : nextInModule ? { id: nextInModule.id, title: nextInModule.title } : null,
      durationSec,
    };
  })();
  return result;
}
