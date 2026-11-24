import { describe, expect, it } from 'vitest';
import {
  activityStars,
  helpAfterFailure,
  levelFromXp,
  levelProgress,
  mascotStage,
  skillLevel,
  starsForQuestion,
  xpForAttempt,
  xpToReachLevel,
} from '../src/services/gamification.js';

describe('estrellas por pregunta', () => {
  it('da 3 estrellas al acertar a la primera sin pistas', () => {
    expect(starsForQuestion({ tries: 1, hintsUsed: 0, revealed: false })).toBe(3);
  });
  it('da 2 estrellas con un reintento o una pista', () => {
    expect(starsForQuestion({ tries: 2, hintsUsed: 0, revealed: false })).toBe(2);
    expect(starsForQuestion({ tries: 1, hintsUsed: 1, revealed: false })).toBe(2);
  });
  it('da 1 estrella con ayuda completa y nunca 0', () => {
    expect(starsForQuestion({ tries: 3, hintsUsed: 2, revealed: false })).toBe(1);
    expect(starsForQuestion({ tries: 4, hintsUsed: 2, revealed: true })).toBe(1);
  });
});

describe('estrellas de la actividad', () => {
  it('redondea el promedio y nunca baja de 1', () => {
    expect(activityStars([3, 3, 2])).toBe(3);
    expect(activityStars([2, 2, 1])).toBe(2);
    expect(activityStars([1, 1, 1])).toBe(1);
    expect(activityStars([])).toBe(3);
  });
});

describe('niveles', () => {
  it('cada nivel requiere 100 × nivel XP acumulados', () => {
    expect(xpToReachLevel(1)).toBe(0);
    expect(xpToReachLevel(2)).toBe(100);
    expect(xpToReachLevel(3)).toBe(300);
    expect(xpToReachLevel(6)).toBe(1500);
  });
  it('calcula el nivel y su nombre', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(650)).toBe(4);
    expect(levelFromXp(99999)).toBe(6);
    expect(levelProgress(650)).toMatchObject({ level: 4, levelName: 'Explorador emocional', xpIntoLevel: 50, xpForNextLevel: 400 });
    expect(levelProgress(5000)).toMatchObject({ level: 6, isMax: true, percent: 100 });
  });
  it('Nubi evoluciona en los niveles 1, 3 y 5', () => {
    expect(mascotStage(1).stage).toBe(1);
    expect(mascotStage(2).stage).toBe(1);
    expect(mascotStage(3).stage).toBe(2);
    expect(mascotStage(5).stage).toBe(3);
  });
});

describe('XP', () => {
  it('suma 10 por estrella, 20 por actividad y 50 por módulo', () => {
    const xp = xpForAttempt({ questionStars: [3, 3, 2], activityType: 'identifica', persevered: false, moduleCompletedNow: true });
    expect(xp.total).toBe(80 + 20 + 50);
  });
  it('premia la perseverancia y la calma con +5', () => {
    expect(xpForAttempt({ questionStars: [2], activityType: 'identifica', persevered: true, moduleCompletedNow: false }).total).toBe(20 + 20 + 5);
    expect(xpForAttempt({ questionStars: [], activityType: 'respira', persevered: false, moduleCompletedNow: false }).total).toBe(30 + 20 + 5);
  });
});

describe('habilidades y ayuda progresiva', () => {
  it('usa solo niveles positivos', () => {
    expect(skillLevel(80)).toBe('Muy bueno');
    expect(skillLevel(60)).toBe('Bueno');
    expect(skillLevel(10)).toBe('En progreso');
    expect(skillLevel(0)).toBe('Por explorar');
  });
  it('ofrece pista, segunda pista y luego la respuesta', () => {
    expect(helpAfterFailure(1)).toBe('hint1');
    expect(helpAfterFailure(2)).toBe('hint2');
    expect(helpAfterFailure(3)).toBe('reveal');
  });
});
