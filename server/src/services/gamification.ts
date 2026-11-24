/**
 * Reglas de gamificación (sección 8 del documento de contexto).
 * Funciones puras: no tocan la base de datos y tienen pruebas unitarias.
 */

export const XP_PER_STAR = 10;
export const XP_ACTIVITY_COMPLETE = 20;
export const XP_MODULE_COMPLETE = 50;
export const XP_PERSEVERANCE = 5;
export const XP_CALM = 5;
export const MAX_LEVEL = 6;
export const DEFAULT_WEEKLY_GOAL = 5;

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Semilla emocional',
  2: 'Curioso',
  3: 'Aprendiz',
  4: 'Explorador emocional',
  5: 'Guardián de emociones',
  6: 'Maestro de la calma',
};

/**
 * Estrellas de una pregunta. Nunca 0 por error.
 * - 3: acierto al primer intento y sin pistas.
 * - 2: con un reintento o una pista.
 * - 1: con ayuda completa (respuesta mostrada, segunda pista o varios reintentos).
 */
export function starsForQuestion({
  tries,
  hintsUsed,
  revealed,
}: {
  tries: number;
  hintsUsed: number;
  revealed: boolean;
}): 1 | 2 | 3 {
  if (revealed) return 1;
  const helpLevel = Math.max(tries - 1, hintsUsed);
  if (helpLevel <= 0) return 3;
  if (helpLevel === 1) return 2;
  return 1;
}

/** Estrellas de una actividad: promedio redondeado de sus preguntas (mínimo 1). */
export function activityStars(questionStars: number[]): number {
  if (questionStars.length === 0) return 3;
  const avg = questionStars.reduce((a, b) => a + b, 0) / questionStars.length;
  return Math.min(3, Math.max(1, Math.round(avg)));
}

/** XP acumulada necesaria para alcanzar un nivel: cada nivel pide 100 × nivel. */
export function xpToReachLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l += 1) total += 100 * l;
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpToReachLevel(level + 1)) level += 1;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const floor = xpToReachLevel(level);
  const isMax = level >= MAX_LEVEL;
  const next = isMax ? floor : xpToReachLevel(level + 1);
  const span = Math.max(1, next - floor);
  return {
    level,
    levelName: LEVEL_NAMES[level],
    xp,
    xpIntoLevel: xp - floor,
    xpForNextLevel: isMax ? 0 : span,
    percent: isMax ? 100 : Math.round(((xp - floor) / span) * 100),
    isMax,
  };
}

/** Nubi evoluciona en los niveles 1, 3 y 5. */
export function mascotStage(level: number): { stage: 1 | 2 | 3; name: string } {
  if (level >= 5) return { stage: 3, name: 'Nube arcoíris' };
  if (level >= 3) return { stage: 2, name: 'Nube feliz' };
  return { stage: 1, name: 'Nubecita' };
}

export interface AttemptXpInput {
  questionStars: number[];
  activityType: string;
  persevered: boolean;
  moduleCompletedNow: boolean;
}

/** XP de un intento completado, con el desglose que se muestra en el cierre. */
export function xpForAttempt({ questionStars, activityType, persevered, moduleCompletedNow }: AttemptXpInput) {
  const starTotal = questionStars.length ? questionStars.reduce((a, b) => a + b, 0) : 3;
  const parts = [
    { label: 'Estrellas', xp: starTotal * XP_PER_STAR },
    { label: 'Actividad completada', xp: XP_ACTIVITY_COMPLETE },
  ];
  if (persevered) parts.push({ label: 'Lo intentaste otra vez', xp: XP_PERSEVERANCE });
  if (activityType === 'respira') parts.push({ label: 'Practicaste la calma', xp: XP_CALM });
  if (moduleCompletedNow) parts.push({ label: 'Módulo completado', xp: XP_MODULE_COMPLETE });
  return { total: parts.reduce((a, p) => a + p.xp, 0), parts };
}

export type SkillLevel = 'Muy bueno' | 'Bueno' | 'En progreso' | 'Por explorar';

/** Nivel de habilidad = % de estrellas obtenidas sobre las posibles. */
export function skillLevel(percent: number): SkillLevel {
  if (percent >= 75) return 'Muy bueno';
  if (percent >= 50) return 'Bueno';
  if (percent >= 1) return 'En progreso';
  return 'Por explorar';
}

/** Próxima pista tras un fallo: 1.ª pista, 2.ª pista y luego la respuesta. */
export function helpAfterFailure(failures: number): 'hint1' | 'hint2' | 'reveal' {
  if (failures <= 1) return 'hint1';
  if (failures === 2) return 'hint2';
  return 'reveal';
}
