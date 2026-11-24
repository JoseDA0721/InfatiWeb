import { Delete } from 'lucide-react';
import { useEffect } from 'react';

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  disabled?: boolean;
}

/** Teclado numérico grande. El PIN nunca se muestra: solo puntos llenos. */
export function PinPad({ value, onChange, length = 4, label = 'PIN de familia', disabled = false }: PinPadProps) {
  useEffect(() => {
    if (disabled) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (/^\d$/.test(event.key) && value.length < length) onChange(value + event.key);
      if (event.key === 'Backspace') onChange(value.slice(0, -1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [value, onChange, length, disabled]);

  return (
    <div className="pin">
      <div className="pin__dots" role="img" aria-label={`${label}: ${value.length} de ${length} números escritos`}>
        {Array.from({ length }, (_, i) => (
          <span key={i} className={i < value.length ? 'is-filled' : ''} />
        ))}
      </div>
      <div className="pin__pad" role="group" aria-label="Teclado numérico">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            className="pin__key"
            disabled={disabled || value.length >= length}
            onClick={() => onChange(value + digit)}
          >
            {digit}
          </button>
        ))}
        <span aria-hidden="true" />
        <button type="button" className="pin__key" disabled={disabled || value.length >= length} onClick={() => onChange(value + '0')}>
          0
        </button>
        <button
          type="button"
          className="pin__key pin__key--erase"
          disabled={disabled || value.length === 0}
          onClick={() => onChange(value.slice(0, -1))}
        >
          <Delete aria-hidden="true" />
          <span>Borrar</span>
        </button>
      </div>
    </div>
  );
}
