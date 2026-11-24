import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router';
import { ButtonLink } from '../../components/Button';
import { Nubi } from '../../components/Nubi';
import { ProgressBar } from '../../components/ProgressBar';
import { SpeakButton } from '../../components/SpeakButton';
import { Stars } from '../../components/Stars';
import { ErrorState, LoadingState } from '../../components/States';
import { WeeklyGoal } from '../../components/WeeklyGoal';
import { asset, avatarAsset } from '../../lib/assets';
import { friendlyDate } from '../../lib/format';
import { useHome } from '../../lib/queries';
import './home.css';

export function HomePage() {
  const { data, isPending, error, refetch } = useHome();
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const { profile, modules } = data;
  const next = data.continue;
  const greeting = next
    ? `¡Hola, ${profile.name}! Hoy puedes descubrir algo nuevo sobre tus emociones. Toca el botón morado para seguir con ${next.moduleTitle}.`
    : `¡Hola, ${profile.name}! Completaste todas las aventuras. Puedes jugarlas otra vez desde el mapa.`;

  return (
    <div className="page home">
      <section className="home-hero" aria-labelledby="saludo">
        <img className="home-hero__avatar" src={avatarAsset(profile.avatarId)} alt="" />
        <div className="home-hero__copy">
          <p className="chip">
            <span className="num">Nivel {profile.level}</span> · {profile.levelName}
          </p>
          <h1 id="saludo">¡Hola, {profile.name}!</h1>
          <p className="home-hero__lead">Hoy puedes descubrir algo nuevo sobre tus emociones.</p>
          {next ? (
            <ButtonLink
              to={`/actividad/${next.activityId}`}
              variant="primary"
              size="xl"
              className="home-hero__cta"
              iconEnd={<ArrowRight aria-hidden="true" className="btn__icon" />}
            >
              {next.inProgress ? 'Retomar' : 'Seguir'}: {next.moduleTitle}
            </ButtonLink>
          ) : (
            <ButtonLink to="/mapa" variant="primary" size="xl" className="home-hero__cta">
              Jugar otra vez en el mapa
            </ButtonLink>
          )}
          {next && <p className="home-hero__next">Próxima aventura: {next.activityTitle}</p>}
          <SpeakButton text={greeting} />
        </div>
        <Nubi stage={profile.mascot.stage} size={260} className="home-hero__nubi" float />
      </section>

      <div className="home-grid">
        <section className="card" aria-labelledby="meta">
          <h2 id="meta">Tu meta semanal</h2>
          <WeeklyGoal weekly={profile.weekly} />
        </section>

        <section className="card card--ink last-played" aria-labelledby="ultimo">
          <h2 id="ultimo">Lo último que hice</h2>
          {data.last ? (
            <>
              <p className="last-played__title">{data.last.title}</p>
              <p className="last-played__meta">
                {data.last.moduleTitle} · {friendlyDate(data.last.finishedAt)}
              </p>
              <Stars count={data.last.stars} />
              <ButtonLink to={`/actividad/${data.last.activityId}`} variant="soft" size="md">
                Jugar otra vez
              </ButtonLink>
            </>
          ) : (
            <>
              <p className="last-played__meta">Todavía no juegas ninguna aventura. ¡La primera te espera!</p>
              {next && (
                <ButtonLink to={`/actividad/${next.activityId}`} variant="soft" size="md">
                  Empezar
                </ButtonLink>
              )}
            </>
          )}
        </section>
      </div>

      <section aria-labelledby="camino">
        <div className="section-head">
          <h2 id="camino">Elige una aventura</h2>
          <ButtonLink to="/mapa" variant="ghost" iconEnd={<ArrowRight aria-hidden="true" className="btn__icon" />}>
            Ver el mapa completo
          </ButtonLink>
        </div>
        <ul className="module-grid">
          {modules.map((module, i) => {
            const previous = modules[i - 1];
            const content = (
              <>
                <img className="module-card__icon" src={asset(module.icon)} alt="" />
                <span className="module-card__body">
                  <strong className="module-card__title">{module.title}</strong>
                  {module.unlocked ? (
                    <>
                      <span className="module-card__meta num">
                        {module.complete ? '¡Completado!' : `${module.completedCount} de ${module.total} actividades`}
                      </span>
                      <ProgressBar
                        value={(module.completedCount / module.total) * 100}
                        label={`Avance en ${module.title}`}
                        valueText={`${module.completedCount} de ${module.total} actividades`}
                        tone={module.complete ? 'success' : 'action'}
                      />
                    </>
                  ) : (
                    <span className="module-card__meta">Se abre al completar «{previous?.title}»</span>
                  )}
                </span>
                {module.unlocked ? (
                  <ArrowRight aria-hidden="true" className="module-card__go" />
                ) : (
                  <Lock aria-hidden="true" className="module-card__go" />
                )}
              </>
            );
            return (
              <li key={module.id}>
                {module.unlocked ? (
                  <Link to={`/mapa/${module.id}`} className="module-card">
                    {content}
                  </Link>
                ) : (
                  <div className="module-card is-locked" aria-label={`${module.title}: bloqueado`}>
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
