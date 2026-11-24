/** Fechas en hora local del servidor: la semana empieza el lunes. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfWeek(now: Date = new Date()): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const weekday = (start.getDay() + 6) % 7; // lunes = 0
  start.setDate(start.getDate() - weekday);
  return start;
}

export function weekDays(now: Date = new Date()): Date[] {
  const start = startOfWeek(now);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export const nowIso = () => new Date().toISOString();
