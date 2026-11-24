import { Clock, Lock } from 'lucide-react';
import { useParams } from 'react-router';
import { ButtonLink } from '../../components/Button';
import { SpeakButton } from '../../components/SpeakButton';
import { Stars } from '../../components/Stars';
import { ErrorState, LoadingState } from '../../components/States';
import { asset } from '../../lib/assets';
import { useMap } from '../../lib/queries';
import './map.css';

const STATUS = {
  nueva: { label: 'Nueva', tone: 'new' },
  en_curso: { label: 'En curso', tone: 'progress' },
  completada: { label: 'Completada', tone: 'done' },
  bloqueada: { label: 'Bloqueada', tone: 'locked' },
} as const;

export function ModulePage() {
  const { moduleId } = useParams();
  const { data, isPending, error, refetch } = useMap();
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  const module = data.modules.find((m) => String(m.id) === moduleId);
  if (!module) return <ErrorState message="No encontramos este mundo. Vuelve al mapa para elegir otro." />;

  const intro = `${module.title}. ${module.activities.length} actividades. Toca Jugar en la que quieras.`;

  return (
    <div className="page module">
      <header className="page-head">
        <img className="module__cover" src={asset(module.icon)} alt="" />
        <div>
          <h1>{module.title}</h1>
          <p className="lead num">
            {module.completedCount} de {module.total} actividades completadas
          </p>
        </div>
        <SpeakButton text={intro} />
      </header>

      {!module.unlocked && (
        <p className="notice notice--info">
          <Lock aria-hidden="true" /> Este mundo se abre cuando completes el anterior.
        </p>
      )}

      <ol className="activity-list">
        {module.activities.map((a) => {
          const status = STATUS[a.status];
          return (
            <li key={a.id} className={`activity-row activity-row--${status.tone}`}>
              <span className="activity-row__pos num" aria-hidden="true">
                {a.position}
              </span>
              <div className="activity-row__body">
                <h2>{a.title}</h2>
                <p className="activity-row__meta">
                  {a.typeLabel} · <Clock aria-hidden="true" /> {a.estMinutes} min
                </p>
                <p className="activity-row__status">
                  <span className={`status status--${status.tone}`}>{status.label}</span>
                  {a.status === 'completada' && <Stars count={a.stars} size="sm" />}
                </p>
              </div>
              {a.status === 'bloqueada' ? (
                <span className="activity-row__locked">
                  <Lock aria-hidden="true" /> Termina la anterior
                </span>
              ) : (
                <ButtonLink
                  to={`/actividad/${a.id}`}
                  variant={a.status === 'completada' ? 'secondary' : 'primary'}
                  size="lg"
                  aria-label={`${a.status === 'en_curso' ? 'Retomar' : a.status === 'completada' ? 'Jugar otra vez' : 'Jugar'}: ${a.title}`}
                >
                  {a.status === 'en_curso' ? 'Retomar' : a.status === 'completada' ? 'Jugar otra vez' : 'Jugar'}
                </ButtonLink>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
