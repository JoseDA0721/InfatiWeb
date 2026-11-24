import { Check, CloudOff, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '../../components/Button';
import { SpeakButton } from '../../components/SpeakButton';
import { asset } from '../../lib/assets';
import type { Preferences } from '../../lib/types';
import { usePreferences } from '../preferences/PreferencesContext';
import './settings.css';

function Setting({ picto, title, description, children, id }: { picto: string; title: string; description?: string; children: ReactNode; id: string }) {
  return (
    <section className="setting" aria-labelledby={id}>
      <img className="setting__picto" src={asset(picto)} alt="" />
      <div className="setting__body">
        <h2 id={id}>{title}</h2>
        {description && <p className="setting__desc">{description}</p>}
        <div className="setting__control">{children}</div>
      </div>
    </section>
  );
}

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="choice" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className="choice__option" onClick={() => onChange(o.value)}>
          {value === o.value && <Check aria-hidden="true" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      <span className="switch__text">{checked ? 'Activado' : 'Desactivado'}</span>
    </button>
  );
}

const SAVE_TEXT = {
  idle: null,
  saving: { icon: <LoaderCircle aria-hidden="true" className="spin" />, text: 'Guardando…' },
  saved: { icon: <Check aria-hidden="true" />, text: 'Guardado' },
  error: { icon: <CloudOff aria-hidden="true" />, text: 'No se pudo guardar. Revisa tu conexión.' },
};

export function SettingsPage() {
  const { prefs, update, saveState, speak } = usePreferences();
  const set = <K extends keyof Preferences>(key: K) => (value: Preferences[K]) => update({ [key]: value } as Partial<Preferences>);
  const status = SAVE_TEXT[saveState];

  return (
    <div className="page settings">
      <header className="page-head">
        <div>
          <h1>Cómo quiero ver y oír</h1>
          <p className="lead">Prueba cada opción. Los cambios se ven al instante y se guardan solos.</p>
        </div>
        <p className={`save-status save-status--${saveState}`} role="status" aria-live="polite">
          {status && (
            <>
              {status.icon} {status.text}
            </>
          )}
        </p>
      </header>

      <div className="settings__layout">
        <div className="settings__list">
          <Setting id="s-letra" picto="picto_letra" title="Tamaño de letra">
            <Choice
              label="Tamaño de letra"
              value={prefs.fontScale}
              onChange={set('fontScale')}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'grande', label: 'Grande' },
                { value: 'muy_grande', label: 'Muy grande' },
              ]}
            />
          </Setting>

          <Setting id="s-contraste" picto="picto_contraste" title="Alto contraste" description="Bordes y letras más marcados.">
            <Switch label="Alto contraste" checked={prefs.highContrast} onChange={set('highContrast')} />
          </Setting>

          <Setting id="s-volumen" picto="picto_escuchar" title="Volumen de la voz">
            <div className="slider">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={prefs.volume}
                onChange={(e) => update({ volume: Number(e.target.value), muted: false })}
                aria-labelledby="s-volumen"
                aria-valuetext={`${Math.round(prefs.volume * 100)} %`}
              />
              <span className="num slider__value">{Math.round(prefs.volume * 100)} %</span>
            </div>
            <div className="setting__row">
              <Switch label="Silenciar todo" checked={prefs.muted} onChange={set('muted')} />
              <span className="setting__row-label">Silenciar todo</span>
            </div>
          </Setting>

          <Setting id="s-velocidad" picto="picto_respira" title="Velocidad de la voz">
            <Choice
              label="Velocidad de la voz"
              value={String(prefs.voiceRate) as '0.7' | '0.9' | '1.1'}
              onChange={(v) => {
                update({ voiceRate: Number(v) });
                window.setTimeout(() => speak('Así de rápido hablo.'), 50);
              }}
              options={[
                { value: '0.7', label: 'Lenta' },
                { value: '0.9', label: 'Normal' },
                { value: '1.1', label: 'Rápida' },
              ]}
            />
          </Setting>

          <Setting
            id="s-lectura"
            picto="picto_ayuda"
            title="Cómo quiero las instrucciones"
            description="El texto siempre queda en pantalla."
          >
            <Choice
              label="Modo de lectura"
              value={prefs.readMode}
              onChange={set('readMode')}
              options={[
                { value: 'texto', label: 'Leerlas yo' },
                { value: 'audio', label: 'Escucharlas' },
                { value: 'ambos', label: 'Leer y escuchar' },
              ]}
            />
          </Setting>

          <Setting id="s-movimiento" picto="mascota_nubi" title="Reducir movimiento" description="Quita animaciones y confeti.">
            <Switch label="Reducir movimiento" checked={prefs.reduceMotion} onChange={set('reduceMotion')} />
          </Setting>
        </div>

        <aside className="preview" aria-labelledby="vista-previa">
          <h2 id="vista-previa">Vista previa</h2>
          <div className="preview__card">
            <img src={asset('escena_cumple')} alt="Sofía celebra su cumpleaños" />
            <p className="preview__prompt">Es el cumpleaños de Sofía. ¿Cómo se siente?</p>
            <div className="preview__faces">
              {(['alegria', 'tristeza', 'enojo'] as const).map((e, i) => (
                <span key={e} className="preview__face">
                  <img src={asset(`emo_${e}`)} alt="" />
                  <span>
                    {i + 1}. {e === 'alegria' ? 'Alegría' : e === 'tristeza' ? 'Tristeza' : 'Enojo'}
                  </span>
                </span>
              ))}
            </div>
            <SpeakButton text="Es el cumpleaños de Sofía. ¿Cómo se siente?" />
          </div>
        </aside>
      </div>

      <div className="q-actions q-actions--center">
        <ButtonLink to="/inicio" variant="primary" size="xl">
          Listo
        </ButtonLink>
      </div>
    </div>
  );
}
