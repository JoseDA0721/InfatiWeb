import type { Emotion } from './types';

export const EMOTIONS: Record<Emotion, { label: string; color: string; face: string }> = {
  alegria: { label: 'Alegría', color: 'var(--emo-alegria)', face: 'emo_alegria' },
  tristeza: { label: 'Tristeza', color: 'var(--emo-tristeza)', face: 'emo_tristeza' },
  enojo: { label: 'Enojo', color: 'var(--emo-enojo)', face: 'emo_enojo' },
  miedo: { label: 'Miedo', color: 'var(--emo-miedo)', face: 'emo_miedo' },
  sorpresa: { label: 'Sorpresa', color: 'var(--emo-sorpresa)', face: 'emo_sorpresa' },
};

const dateFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });
const longFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' });

export function friendlyDate(iso: string, now = new Date()) {
  const d = new Date(iso);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff === 0) return `Hoy, ${timeFmt.format(d)}`;
  if (diff === 1) return `Ayer, ${timeFmt.format(d)}`;
  return `${dateFmt.format(d)}, ${timeFmt.format(d)}`;
}

export const longDate = (iso: string) => longFmt.format(new Date(iso));

export function minutesLabel(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export const durationLabel = (sec: number) => minutesLabel(Math.max(1, Math.round(sec / 60)));

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
