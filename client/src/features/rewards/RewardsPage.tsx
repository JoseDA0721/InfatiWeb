import { Check, Lock } from 'lucide-react';
import { Nubi } from '../../components/Nubi';
import { ProgressBar } from '../../components/ProgressBar';
import { SpeakButton } from '../../components/SpeakButton';
import { ErrorState, LoadingState } from '../../components/States';
import { WeeklyGoal } from '../../components/WeeklyGoal';
import { asset } from '../../lib/assets';
import { longDate } from '../../lib/format';
import { useRewards } from '../../lib/queries';
import './rewards.css';

const STAGES = [
  { stage: 1 as const, name: 'Nubecita', level: 1 },
  { stage: 2 as const, name: 'Nube feliz', level: 3 },
  { stage: 3 as const, name: 'Nube arcoíris', level: 5 },
];

export function RewardsPage() {
  const { data, isPending, error, refetch } = useRewards();
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const earned = data.badges.filter((b) => b.earned);
  const stickers = data.stickers.filter((s) => s.earned).length;
  const summary = `Tienes ${earned.length} insignias de ${data.badges.length} y ${stickers} stickers. Nubi es ${data.mascot.name}.`;

  return (
    <div className="page rewards">
      <header className="page-head">
        <div>
          <h1>Mis premios</h1>
          <p className="lead num">
            {earned.length} de {data.badges.length} insignias · {stickers} de {data.stickers.length} stickers
          </p>
        </div>
        <SpeakButton text={summary} />
      </header>

      <section className="card mascot-card" aria-labelledby="mascota">
        <Nubi stage={data.mascot.stage} size={180} float label={`Nubi en etapa ${data.mascot.name}`} />
        <div className="mascot-card__copy">
          <h2 id="mascota">Nubi es {data.mascot.name}</h2>
          <p>
            <strong className="num">Nivel {data.level.level}</strong> · {data.level.levelName}
          </p>
          <ProgressBar
            value={data.level.percent}
            label="Avance hacia el siguiente nivel"
            valueText={data.level.isMax ? 'Nivel máximo' : `${data.level.xpIntoLevel} de ${data.level.xpForNextLevel} XP`}
          />
          <p className="mascot-card__hint num">
            {data.level.isMax
              ? '¡Llegaste al nivel más alto!'
              : `${data.level.xpForNextLevel - data.level.xpIntoLevel} XP para el nivel ${data.level.level + 1}.`}
          </p>
          <ol className="stages" aria-label="Cómo crece Nubi">
            {STAGES.map((s) => (
              <li key={s.stage} className={data.mascot.stage >= s.stage ? 'is-reached' : ''}>
                <Nubi stage={s.stage} size={64} />
                <span>
                  {s.name}
                  <small className="num">Nivel {s.level}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="meta-premios" className="card">
        <h2 id="meta-premios">Meta de la semana</h2>
        <WeeklyGoal weekly={data.weekly} />
      </section>

      <section aria-labelledby="insignias">
        <h2 id="insignias" className="section-title">
          Insignias
        </h2>
        <ul className="badge-grid">
          {data.badges.map((badge) => (
            <li key={badge.code} className={`badge ${badge.earned ? 'is-earned' : 'is-pending'}`}>
              <img src={asset(badge.icon)} alt="" />
              <div>
                <h3>{badge.title}</h3>
                <p>{badge.condition}</p>
                {badge.earned ? (
                  <span className="status status--done">
                    <Check aria-hidden="true" /> Ganada el {longDate(badge.earnedAt!)}
                  </span>
                ) : (
                  <span className="status status--locked">
                    <Lock aria-hidden="true" /> Por ganar
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="album">
        <h2 id="album" className="section-title">
          Mi álbum de stickers
        </h2>
        <p className="section-sub">Ganas un sticker la primera vez que completas cada actividad.</p>
        <ul className="album">
          {data.stickers.map((s, i) => (
            <li key={s.code} className={`sticker ${s.earned ? 'is-earned' : ''}`} style={{ '--tilt': `${((i * 7) % 11) - 5}deg` } as React.CSSProperties}>
              {s.earned ? (
                <>
                  <img src={asset(s.image)} alt="" />
                  <span>{s.title}</span>
                </>
              ) : (
                <>
                  <span className="sticker__empty" aria-hidden="true">
                    ?
                  </span>
                  <span>{s.fromActivity ? `Completa «${s.fromActivity}»` : 'Por descubrir'}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
