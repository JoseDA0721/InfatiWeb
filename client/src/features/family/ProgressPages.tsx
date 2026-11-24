import { Check, Clock3, Lock } from 'lucide-react';
import { useState } from 'react';
import { ProgressBar } from '../../components/ProgressBar';
import { Stars } from '../../components/Stars';
import { ErrorState, LoadingState } from '../../components/States';
import { asset } from '../../lib/assets';
import { durationLabel, friendlyDate, longDate, minutesLabel } from '../../lib/format';
import type { Badge, LevelInfo, Mascot, Sticker, WeeklyStatus } from '../../lib/types';
import { LevelTag, useFamilyChild, useFamilyData, type SkillLevel } from './shared';

/* F3 · Habilidades */
interface Skill {
  code: string;
  title: string;
  percent: number;
  level: SkillLevel;
  completed: number;
  total: number;
  description: string;
}

export function SkillsPage() {
  const child = useFamilyChild();
  const { data, isPending, error, refetch } = useFamilyData<{ skills: Skill[] }>(child.id, 'skills');
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  return (
    <div className="fpage">
      <h1>Habilidades de {child.name}</h1>
      <p className="lead">Estos niveles describen lo que ha practicado. No son una evaluación clínica.</p>
      <ul className="skills">
        {data.skills.map((s) => (
          <li key={s.code} className="skill">
            <div className="skill__head">
              <h2>{s.title}</h2>
              <LevelTag level={s.level} />
            </div>
            <p>{s.description}</p>
            <ProgressBar value={s.percent} label={`${s.title}: ${s.level}`} valueText={`${s.level}, ${s.percent} % de las estrellas posibles`} />
            <p className="skill__meta num">
              {s.completed} de {s.total} actividades completadas · {s.percent} % de las estrellas posibles
            </p>
          </li>
        ))}
      </ul>
      <p className="fnote">
        Cómo se calcula: porcentaje de estrellas obtenidas sobre las posibles en las actividades de cada habilidad. Muy bueno desde 75 %,
        Bueno desde 50 %, En progreso desde 1 %.
      </p>
    </div>
  );
}

/* F4 · Actividades realizadas */
interface HistoryRow {
  id: number;
  title: string;
  moduleTitle: string;
  startedAt: string;
  finishedAt: string | null;
  completed: boolean;
  stars: number;
  durationSec: number;
}

export function ActivitiesPage() {
  const child = useFamilyChild();
  const { data, isPending, error, refetch } = useFamilyData<{ activities: HistoryRow[] }>(child.id, 'activities');
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  return (
    <div className="fpage">
      <h1>Actividades de {child.name}</h1>
      <p className="lead">Lo que ha jugado, de lo más reciente a lo más antiguo.</p>
      {data.activities.length === 0 ? (
        <p className="fempty">Todavía no hay actividades. Cuando {child.name} juegue, aparecerán aquí.</p>
      ) : (
        <div className="table-wrap">
          <table className="ftable">
            <caption className="sr-only">Historial de actividades</caption>
            <thead>
              <tr>
                <th scope="col">Actividad</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estrellas</th>
                <th scope="col">Duración</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.activities.map((a) => (
                <tr key={a.id}>
                  <th scope="row">
                    {a.title}
                    <small>{a.moduleTitle}</small>
                  </th>
                  <td>{friendlyDate(a.finishedAt ?? a.startedAt)}</td>
                  <td>{a.completed ? <Stars count={a.stars} size="sm" /> : <span className="fmuted">—</span>}</td>
                  <td>{a.completed ? durationLabel(a.durationSec) : <span className="fmuted">—</span>}</td>
                  <td>
                    {a.completed ? (
                      <span className="status status--done">
                        <Check aria-hidden="true" /> Completada
                      </span>
                    ) : (
                      <span className="status status--progress">
                        <Clock3 aria-hidden="true" /> En curso
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* F5 · Logros */
interface Achievements {
  badges: (Badge & { earned: boolean; earnedAt: string | null })[];
  stickers: Sticker[];
  level: LevelInfo;
  mascot: Mascot;
  weekly: WeeklyStatus;
}

export function AchievementsPage() {
  const child = useFamilyChild();
  const { data, isPending, error, refetch } = useFamilyData<Achievements>(child.id, 'achievements');
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  const stickers = data.stickers.filter((s) => s.earned);
  return (
    <div className="fpage">
      <h1>Logros de {child.name}</h1>
      <div className="fcolumns">
        <section className="fcard" aria-labelledby="nivel">
          <h2 id="nivel">
            Nivel {data.level.level} · {data.level.levelName}
          </h2>
          <ProgressBar
            value={data.level.percent}
            label="Avance de nivel"
            valueText={data.level.isMax ? 'Nivel máximo' : `${data.level.xpIntoLevel} de ${data.level.xpForNextLevel} XP`}
          />
          <p className="fcard__muted num">
            {data.level.xp} XP acumulados · Nubi está en la etapa «{data.mascot.name}»
          </p>
        </section>
        <section className="fcard" aria-labelledby="meta-logros">
          <h2 id="meta-logros">Meta semanal</h2>
          <p className="fcard__big num">
            {Math.min(data.weekly.completed, data.weekly.goal)} de {data.weekly.goal} actividades
          </p>
          <p>{data.weekly.reached ? 'Meta cumplida esta semana.' : 'La meta se renueva cada lunes, sin perder lo ganado.'}</p>
        </section>
      </div>

      <h2 className="fsection">Insignias</h2>
      <ul className="fbadges">
        {data.badges.map((b) => (
          <li key={b.code} className={`fbadge ${b.earned ? '' : 'is-pending'}`}>
            <img src={asset(b.icon)} alt="" />
            <div>
              <h3>{b.title}</h3>
              <p>{b.earned ? `Ganada el ${longDate(b.earnedAt!)}` : `Cómo se gana: ${b.condition}`}</p>
            </div>
            {b.earned ? <Check aria-label="Ganada" className="fbadge__mark" /> : <Lock aria-label="Por ganar" className="fbadge__mark" />}
          </li>
        ))}
      </ul>

      <h2 className="fsection">
        Stickers <span className="num">({stickers.length} de {data.stickers.length})</span>
      </h2>
      {stickers.length ? (
        <ul className="fstickers">
          {stickers.map((s) => (
            <li key={s.code}>
              <img src={asset(s.image)} alt="" />
              <span>{s.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="fempty">Cada actividad completada por primera vez agrega un sticker a su álbum.</p>
      )}
    </div>
  );
}

/* F6 · Tiempo de uso */
interface Usage {
  week: { day: string; label: string; short: string; minutes: number; isFuture: boolean }[];
  totalMinutes: number;
  lastWeekMinutes: number;
}

export function UsagePage() {
  const child = useFamilyChild();
  const [asTable, setAsTable] = useState(false);
  const { data, isPending, error, refetch } = useFamilyData<Usage>(child.id, 'usage');
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  const max = Math.max(30, ...data.week.map((d) => d.minutes));
  const busiest = [...data.week].sort((a, b) => b.minutes - a.minutes)[0];
  const alt = `Minutos de uso por día esta semana. Total ${minutesLabel(data.totalMinutes)}. ${data.week
    .filter((d) => !d.isFuture)
    .map((d) => `${d.label}: ${d.minutes} minutos`)
    .join('. ')}.`;
  const diff = data.totalMinutes - data.lastWeekMinutes;

  return (
    <div className="fpage">
      <h1>Tiempo de uso</h1>
      <p className="lead">Resumen de esta semana, de lunes a domingo.</p>
      <div className="usage-total">
        <p className="fcard__big num">{minutesLabel(data.totalMinutes)}</p>
        <p>
          {data.lastWeekMinutes === 0
            ? 'Es la primera semana con registro.'
            : diff === 0
              ? 'Lo mismo que la semana pasada.'
              : `${minutesLabel(Math.abs(diff))} ${diff > 0 ? 'más' : 'menos'} que la semana pasada (${minutesLabel(data.lastWeekMinutes)}).`}
          {busiest && busiest.minutes > 0 && ` El día con más uso fue el ${busiest.label.toLowerCase()}.`}
        </p>
      </div>

      <div className="usage-toggle" role="group" aria-label="Forma de ver los datos">
        <button type="button" aria-pressed={!asTable} onClick={() => setAsTable(false)}>
          Gráfico
        </button>
        <button type="button" aria-pressed={asTable} onClick={() => setAsTable(true)}>
          Tabla
        </button>
      </div>

      {!asTable ? (
        <figure className="chart">
          <div className="chart__plot" role="img" aria-label={alt}>
            {data.week.map((d) => (
              <div key={d.day} className={`chart__col ${d.isFuture ? 'is-future' : ''}`}>
                <span className="chart__value num" aria-hidden="true">{d.isFuture ? '' : `${d.minutes} min`}</span>
                <span className="chart__bar" style={{ blockSize: `${(d.minutes / max) * 100}%` }} />
                <span className="chart__day">{d.short}</span>
              </div>
            ))}
          </div>
          <figcaption className="fnote">Minutos por día. Los días que aún no llegan quedan vacíos.</figcaption>
        </figure>
      ) : (
        <div className="table-wrap">
          <table className="ftable">
            <caption>Minutos de uso por día</caption>
            <thead>
              <tr>
                <th scope="col">Día</th>
                <th scope="col">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {data.week.map((d) => (
                <tr key={d.day}>
                  <th scope="row">{d.label}</th>
                  <td className="num">{d.isFuture ? 'Aún no llega' : minutesLabel(d.minutes)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td className="num">{minutesLabel(data.totalMinutes)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <p className="fnote">El tiempo se cuenta solo mientras la página está abierta y visible.</p>
    </div>
  );
}
