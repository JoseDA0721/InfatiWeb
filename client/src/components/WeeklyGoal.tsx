import { Check } from 'lucide-react';
import type { WeeklyStatus } from '../lib/types';

/** Meta semanal: 7 casillas, una por día. Faltar un día no quita nada. */
export function WeeklyGoal({ weekly, compact = false }: { weekly: WeeklyStatus; compact?: boolean }) {
  const left = Math.max(0, weekly.goal - weekly.completed);
  return (
    <div className={`weekly ${compact ? 'weekly--compact' : ''}`}>
      <p className="weekly__count">
        <strong className="num">
          {Math.min(weekly.completed, weekly.goal)} de {weekly.goal}
        </strong>{' '}
        aventuras esta semana
      </p>
      <ol className="weekly__days" aria-label="Días de esta semana">
        {weekly.days.map((day) => (
          <li
            key={day.key}
            className={`weekly__day ${day.played ? 'is-played' : ''} ${day.isToday ? 'is-today' : ''}`}
            aria-label={`${day.label}: ${day.played ? 'jugaste' : 'sin juego'}${day.isToday ? ' (hoy)' : ''}`}
          >
            {day.played ? <Check aria-hidden="true" /> : <span aria-hidden="true">{day.short}</span>}
          </li>
        ))}
      </ol>
      {!compact && (
        <p className="weekly__note">
          {weekly.reached
            ? '¡Cumpliste tu meta de la semana!'
            : left === 1
              ? 'Una aventura más y ganarás la insignia Constancia.'
              : `Te faltan ${left} aventuras para la insignia Constancia.`}
        </p>
      )}
    </div>
  );
}
