import { Square } from 'lucide-react';
import { useId } from 'react';
import { usePreferences } from '../features/preferences/PreferencesContext';
import { asset } from '../lib/assets';
import { speechSupported, useSpeakingId } from '../lib/speech';
import { useToast } from './Toast';

interface SpeakButtonProps {
  text: string;
  label?: string;
  size?: 'md' | 'lg';
  className?: string;
}

/** Botón «Escuchar»: parlante + texto. Funciona con toque y con teclado. */
export function SpeakButton({ text, label = 'Escuchar', size = 'md', className = '' }: SpeakButtonProps) {
  const { speak, stop, prefs } = usePreferences();
  const toast = useToast();
  const id = useId();
  const speaking = useSpeakingId() === id;

  function handleClick() {
    if (speaking) return stop();
    if (!speechSupported) return toast('Este navegador no puede leer en voz alta. El texto está en pantalla.');
    if (prefs.muted) return toast('El sonido está apagado. Actívalo con el botón Sonido de arriba.');
    speak(text, id);
  }

  return (
    <button
      type="button"
      className={`btn btn--soft btn--${size} speak-btn ${speaking ? 'is-speaking' : ''} ${className}`}
      onClick={handleClick}
      aria-pressed={speaking}
    >
      {speaking ? <Square aria-hidden="true" className="btn__icon" /> : <img className="btn__picto" src={asset('picto_escuchar')} alt="" />}
      <span className="btn__label">{speaking ? 'Detener' : label}</span>
    </button>
  );
}
