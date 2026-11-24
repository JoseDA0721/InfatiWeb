import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { usePreferences } from '../features/preferences/PreferencesContext';

/** Control de volumen y silencio siempre visible en la barra superior. */
export function SoundControl() {
  const { prefs, update, speak } = usePreferences();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const Icon = prefs.muted || prefs.volume === 0 ? VolumeX : prefs.volume < 0.5 ? Volume1 : Volume2;

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (event instanceof MouseEvent && wrapper.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="sound" ref={wrapper}>
      <button
        type="button"
        className={`nav-btn ${prefs.muted ? 'is-muted' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon aria-hidden="true" className="nav-btn__icon" />
        <span className="nav-btn__label">{prefs.muted ? 'Sin sonido' : 'Sonido'}</span>
      </button>
      {open && (
        <div className="sound__panel" id={panelId} role="group" aria-label="Sonido">
          <label className="sound__row">
            <span>Volumen</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={prefs.volume}
              onChange={(e) => update({ volume: Number(e.target.value), muted: false })}
              onPointerUp={() => speak('Así suena mi voz.')}
              onKeyUp={(e) => (e.key.startsWith('Arrow') ? speak('Así suena mi voz.') : undefined)}
              aria-valuetext={`${Math.round(prefs.volume * 100)} %`}
            />
            <span className="num sound__value">{Math.round(prefs.volume * 100)} %</span>
          </label>
          <button
            type="button"
            className={`btn btn--md ${prefs.muted ? 'btn--primary' : 'btn--secondary'} btn--block`}
            aria-pressed={prefs.muted}
            onClick={() => update({ muted: !prefs.muted })}
          >
            {prefs.muted ? <Volume2 aria-hidden="true" className="btn__icon" /> : <VolumeX aria-hidden="true" className="btn__icon" />}
            <span className="btn__label">{prefs.muted ? 'Activar sonido' : 'Silenciar'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
