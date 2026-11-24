import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Nubi } from '../../components/Nubi';
import { usePreferences } from '../preferences/PreferencesContext';

const CYCLES = 4;
const PHASES = [
  { id: 'inhala', label: 'Inhala', say: 'Inhala despacio', seconds: 4 },
  { id: 'sostén', label: 'Sostén', say: 'Sostén', seconds: 2 },
  { id: 'exhala', label: 'Exhala', say: 'Exhala suave', seconds: 5 },
] as const;

/**
 * Respira conmigo: un círculo crece al inhalar y baja al exhalar.
 * Audio guiado, botón de pausa, sin evaluación. Con «reducir movimiento» el
 * círculo no cambia de tamaño: la guía es el texto y la cuenta.
 */
export function Breathing({ onFinish, finishing }: { onFinish: () => void; finishing: boolean }) {
  const { speak, cue, prefs } = usePreferences();
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const phase = PHASES[phaseIndex];

  useEffect(() => {
    if (!running || done) return;
    if (count === 0) speak(phase.say);
    const t = window.setTimeout(() => {
      if (count + 1 < phase.seconds) return setCount(count + 1);
      setCount(0);
      if (phaseIndex + 1 < PHASES.length) return setPhaseIndex(phaseIndex + 1);
      setPhaseIndex(0);
      if (cycle + 1 < CYCLES) return setCycle(cycle + 1);
      setRunning(false);
      setDone(true);
      cue('celebrate');
      speak('¡Muy bien! Tu cuerpo está más tranquilo.');
    }, 1000);
    return () => window.clearTimeout(t);
  }, [running, done, count, phaseIndex, cycle, phase, speak, cue]);

  function toggle() {
    if (!started.current) started.current = true;
    setRunning((r) => !r);
  }

  function restart() {
    setCycle(0);
    setPhaseIndex(0);
    setCount(0);
    setDone(false);
    setRunning(true);
  }

  const scale = phase.id === 'inhala' ? 0.6 + (0.4 * (count + 1)) / phase.seconds : phase.id === 'sostén' ? 1 : 1 - (0.4 * (count + 1)) / phase.seconds;

  return (
    <div className="breath">
      <div className="breath__stage">
        <div
          className={`breath__circle breath__circle--${phase.id} ${running ? 'is-running' : ''}`}
          style={{ '--scale': prefs.reduceMotion ? 1 : running || done ? scale : 0.7 } as React.CSSProperties}
          aria-hidden="true"
        />
        <Nubi size={150} stage={done ? 2 : 1} className="breath__nubi" />
      </div>

      <div className="breath__guide" aria-live="polite">
        {done ? (
          <p className="breath__word">¡Muy bien!</p>
        ) : started.current ? (
          <>
            <p className="breath__word">{phase.label}</p>
            <p className="breath__count num">{count + 1}</p>
          </>
        ) : (
          <p className="breath__word">¿Listo?</p>
        )}
        <p className="breath__cycle num">
          {done ? 'Tu cuerpo está más tranquilo.' : `Respiración ${Math.min(cycle + 1, CYCLES)} de ${CYCLES}`}
        </p>
      </div>

      <div className="q-actions">
        {done ? (
          <>
            <Button variant="secondary" size="lg" icon={<RotateCcw aria-hidden="true" className="btn__icon" />} onClick={restart}>
              Respirar otra vez
            </Button>
            <Button variant="primary" size="xl" onClick={onFinish} disabled={finishing} autoFocus>
              Terminar
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="xl"
            icon={running ? <Pause aria-hidden="true" className="btn__icon" /> : <Play aria-hidden="true" className="btn__icon" />}
            onClick={toggle}
          >
            {running ? 'Pausa' : started.current ? 'Continuar' : 'Empezar a respirar'}
          </Button>
        )}
      </div>
    </div>
  );
}
