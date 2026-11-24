import { ArrowRight, Map } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { ButtonLink } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Nubi } from '../../components/Nubi';
import { ProgressBar } from '../../components/ProgressBar';
import { Stars } from '../../components/Stars';
import { asset } from '../../lib/assets';
import type { FinishResult } from '../../lib/types';
import { usePreferences } from '../preferences/PreferencesContext';

const CONFETTI = ['#FFD84D', '#6BB6FF', '#FF6B5E', '#B58CFF', '#FFA94D', '#8ED081'];

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          style={
            {
              '--x': `${(i * 37) % 100}%`,
              '--delay': `${(i % 7) * 90}ms`,
              '--spin': `${(i % 2 ? 1 : -1) * (200 + i * 13)}deg`,
              background: CONFETTI[i % CONFETTI.length],
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Cierre de actividad (N9): celebración, estrellas, XP, nivel, insignia nueva con su nombre. */
export function Celebration({ result, childName, onClose }: { result: FinishResult; childName: string; onClose: () => void }) {
  const { speak, cue, prefs } = usePreferences();

  useEffect(() => {
    cue('celebrate');
    const parts = [
      `¡Lo lograste, ${childName}!`,
      `Ganaste ${result.stars} ${result.stars === 1 ? 'estrella' : 'estrellas'} y ${result.xp.total} puntos.`,
      result.badges.length ? `Nueva insignia: ${result.badges.map((b) => b.title).join(' y ')}.` : '',
      result.moduleCompleted ? '¡Has completado el nivel!' : '',
      result.levelUp ? `Subiste al nivel ${result.level.level}, ${result.level.levelName}.` : '',
    ];
    speak(parts.filter(Boolean).join(' '));
  }, [result, childName, speak, cue]);

  return (
    <Modal open onClose={onClose} title={`¡Lo lograste, ${childName}!`} tone="celebration" hideClose>
      {!prefs.reduceMotion && <Confetti />}
      <div className="celebrate">
        <Nubi size={130} stage={result.mascot.stage} className="celebrate__nubi" float />
        <p className="celebrate__activity">Completaste «{result.activityTitle}»</p>
        <Stars count={result.stars} size="lg" animate />

        <div className="celebrate__xp">
          <p className="celebrate__xp-total num">+{result.xp.total} XP</p>
          <ul className="celebrate__xp-parts">
            {result.xp.parts.map((p) => (
              <li key={p.label}>
                <span>{p.label}</span>
                <span className="num">+{p.xp}</span>
              </li>
            ))}
          </ul>
          <p className="celebrate__level">
            <strong className="num">Nivel {result.level.level}</strong> · {result.level.levelName}
            {result.levelUp && <span className="chip chip--success">¡Subiste de nivel!</span>}
          </p>
          <ProgressBar
            value={result.level.percent}
            label="Avance hacia el siguiente nivel"
            valueText={
              result.level.isMax ? 'Nivel máximo' : `${result.level.xpIntoLevel} de ${result.level.xpForNextLevel} XP para el siguiente nivel`
            }
          />
          {result.mascotEvolved && <p className="celebrate__note">¡Nubi creció! Ahora es {result.mascot.name}.</p>}
        </div>

        {result.moduleCompleted && (
          <div className="celebrate__module">
            <p className="celebrate__module-title">¡Has completado el nivel!</p>
            <p>
              Terminaste «{result.moduleCompleted.title}».
              {result.unlockedModule && <> Se abrió «{result.unlockedModule.title}».</>}
            </p>
          </div>
        )}

        {(result.badges.length > 0 || result.sticker) && (
          <ul className="celebrate__prizes">
            {result.badges.map((badge) => (
              <li key={badge.code} className="prize">
                <img src={asset(badge.icon)} alt="" />
                <span>
                  <small>Insignia nueva</small>
                  <strong>{badge.title}</strong>
                </span>
              </li>
            ))}
            {result.sticker && (
              <li className="prize">
                <img src={asset(result.sticker.image)} alt="" className="prize__sticker" />
                <span>
                  <small>Sticker para tu álbum</small>
                  <strong>{result.sticker.title}</strong>
                </span>
              </li>
            )}
          </ul>
        )}

        <div className="celebrate__actions">
          {result.next ? (
            <ButtonLink
              to={`/actividad/${result.next.id}`}
              variant="primary"
              size="xl"
              block
              iconEnd={<ArrowRight aria-hidden="true" className="btn__icon" />}
              onClick={onClose}
              autoFocus
            >
              Otra actividad
            </ButtonLink>
          ) : null}
          <ButtonLink to="/mapa" variant="secondary" size="lg" block icon={<Map aria-hidden="true" className="btn__icon" />} onClick={onClose}>
            Volver al mapa
          </ButtonLink>
          <Link to="/premios" className="celebrate__link" onClick={onClose}>
            Ver mis premios
          </Link>
        </div>
      </div>
    </Modal>
  );
}
