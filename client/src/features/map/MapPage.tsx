import { Check, Lock } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Nubi } from '../../components/Nubi';
import { SpeakButton } from '../../components/SpeakButton';
import { Stars } from '../../components/Stars';
import { ErrorState, LoadingState } from '../../components/States';
import { asset } from '../../lib/assets';
import { EMOTIONS } from '../../lib/format';
import { useMap, useMe } from '../../lib/queries';
import type { MapActivity, MapModule } from '../../lib/types';
import './map.css';

/** Posición horizontal de cada estación (en % del ancho): el camino serpentea. */
const xOf = (i: number) => (i % 2 === 0 ? 28 : 72);
const STATUS_TEXT = { completada: 'Completada', en_curso: 'Estás aquí', nueva: 'Lista', bloqueada: 'Bloqueada' } as const;

function stationLabel(a: MapActivity, isCurrent: boolean) {
  const status = isCurrent ? 'Estás aquí' : STATUS_TEXT[a.status];
  const stars = a.status === 'completada' ? `, ${a.stars} de 3 estrellas` : '';
  return `${a.position}. ${a.title}. ${a.typeLabel}. ${status}${stars}`;
}

function Station({ activity, index, isCurrent }: { activity: MapActivity; index: number; isCurrent: boolean }) {
  const locked = activity.status === 'bloqueada';
  const face = activity.emotion ? asset(EMOTIONS[activity.emotion].face) : null;
  const inner = (
    <>
      <span className="station__disc">
        {activity.status === 'completada' ? (
          <Check aria-hidden="true" className="station__check" />
        ) : locked ? (
          <Lock aria-hidden="true" />
        ) : face ? (
          <img src={face} alt="" />
        ) : (
          <span className="num">{activity.position}</span>
        )}
      </span>
      <span className="station__text">
        <strong>{activity.title}</strong>
        <small>{isCurrent ? 'Estás aquí' : STATUS_TEXT[activity.status]}</small>
        {activity.status === 'completada' && <Stars count={activity.stars} size="sm" />}
      </span>
    </>
  );
  const style = { '--x': `${xOf(index)}%` } as React.CSSProperties;
  const className = `station station--${activity.status} ${isCurrent ? 'is-current' : ''} ${xOf(index) > 50 ? 'is-right' : 'is-left'}`;
  return (
    <li className="station-row" style={style}>
      {locked ? (
        <div className={className} aria-label={stationLabel(activity, false)} role="img">
          {inner}
        </div>
      ) : (
        <Link
          to={`/actividad/${activity.id}`}
          className={className}
          aria-label={stationLabel(activity, isCurrent)}
          data-current={isCurrent || undefined}
        >
          {inner}
        </Link>
      )}
    </li>
  );
}

/** Camino dibujado entre estaciones; se adapta al ancho con trazo de grosor fijo. */
function Trail({ count, doneUntil }: { count: number; doneUntil: number }) {
  const segments = [];
  for (let i = 0; i < count - 1; i += 1) {
    const x1 = xOf(i);
    const x2 = xOf(i + 1);
    const y1 = i + 0.5;
    const y2 = i + 1.5;
    segments.push(
      <path
        key={i}
        d={`M${x1} ${y1} C${x1} ${y1 + 0.55} ${x2} ${y2 - 0.55} ${x2} ${y2}`}
        className={i < doneUntil ? 'trail__done' : 'trail__todo'}
        vectorEffect="non-scaling-stroke"
      />,
    );
  }
  return (
    <svg className="trail" viewBox={`0 0 100 ${count}`} preserveAspectRatio="none" aria-hidden="true">
      {segments}
    </svg>
  );
}

function ModuleTrack({ module, currentId, stage }: { module: MapModule; currentId: number | null; stage: 1 | 2 | 3 }) {
  const currentIndex = module.activities.findIndex((a) => a.id === currentId);
  const completed = module.activities.filter((a) => a.status === 'completada').length;
  const [nubiAt, setNubiAt] = useState(currentIndex > 0 ? currentIndex - 1 : currentIndex);

  // Nubi camina desde la estación anterior hasta la actual.
  useLayoutEffect(() => {
    if (currentIndex < 0) return;
    const t = window.setTimeout(() => setNubiAt(currentIndex), 250);
    return () => window.clearTimeout(t);
  }, [currentIndex]);

  return (
    <section className={`world ${module.unlocked ? '' : 'world--locked'}`} aria-labelledby={`mundo-${module.id}`}>
      <header className="world__banner">
        <img src={asset(module.icon)} alt="" className="world__cover" loading="lazy" />
        <div className="world__copy">
          <h2 id={`mundo-${module.id}`}>
            <Link to={`/mapa/${module.id}`}>{module.title}</Link>
          </h2>
          <p className="num">
            {module.unlocked
              ? module.complete
                ? '¡Completado! Puedes volver a jugar.'
                : `${completed} de ${module.total} estaciones completadas`
              : 'Se abre al completar el mundo anterior'}
          </p>
        </div>
        {module.unlocked ? (
          <Stars count={Math.round((module.starsEarned / Math.max(1, module.starsPossible)) * 3)} size="sm" />
        ) : (
          <Lock aria-hidden="true" className="world__lock" />
        )}
      </header>
      <div className="track" style={{ '--rows': module.activities.length } as React.CSSProperties}>
        <Trail count={module.activities.length} doneUntil={Math.max(0, completed)} />
        <ol className="track__stations">
          {module.activities.map((activity, i) => (
            <Station key={activity.id} activity={activity} index={i} isCurrent={activity.id === currentId} />
          ))}
        </ol>
        {currentIndex >= 0 && (
          <div
            className="track__nubi"
            style={{ '--x': `${xOf(nubiAt)}%`, '--row': nubiAt } as React.CSSProperties}
            aria-hidden="true"
          >
            <Nubi size={84} stage={stage} />
          </div>
        )}
      </div>
    </section>
  );
}

export function MapPage() {
  const { data, isPending, error, refetch } = useMap();
  const me = useMe();
  const scrolled = useRef(false);

  useEffect(() => {
    if (!data || scrolled.current) return;
    scrolled.current = true;
    const el = document.querySelector('[data-current]');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [data]);

  if (isPending) return <LoadingState label="Preparando tu mapa…" />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const total = data.modules.reduce((s, m) => s + m.total, 0);
  const done = data.modules.reduce((s, m) => s + m.completedCount, 0);
  const current = data.current
    ? data.modules.flatMap((m) => m.activities).find((a) => a.id === data.current!.activityId)
    : undefined;
  const intro = `Este es tu mapa. Llevas ${done} de ${total} estaciones. ${current ? `Nubi te espera en ${current.title}. Toca una estación abierta para jugar.` : 'Completaste todo el camino.'}`;

  return (
    <div className="page map">
      <header className="page-head">
        <div>
          <h1>Mi mapa de aventuras</h1>
          <p className="lead num">
            Llevas {done} de {total} estaciones. {current && <>Nubi te espera en «{current.title}».</>}
          </p>
        </div>
        <SpeakButton text={intro} />
      </header>
      {data.modules.map((module) => (
        <ModuleTrack key={module.id} module={module} currentId={data.current?.activityId ?? null} stage={me.data?.mascot.stage ?? 1} />
      ))}
    </div>
  );
}
