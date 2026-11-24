import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button';
import { Nubi } from '../../components/Nubi';
import { SpeakButton } from '../../components/SpeakButton';
import { api } from '../../lib/api';
import { asset } from '../../lib/assets';
import { usePreferences } from '../preferences/PreferencesContext';
import './help.css';

const HOW = [
  { image: 'picto_mapa', title: 'Elige una aventura', text: 'En Inicio toca el botón morado o elige una estación del mapa.' },
  { image: 'picto_escuchar', title: 'Escucha si quieres', text: 'El botón Escuchar lee la pregunta en voz alta.' },
  { image: 'emo_alegria', title: 'Elige y comprueba', text: 'Toca tu respuesta y luego Comprobar. Puedes intentarlo otra vez.' },
  { image: 'picto_ayuda', title: 'Pide una pista', text: 'Las pistas están al lado de la pregunta. Pedirlas está bien.' },
];

export function HelpPage() {
  const navigate = useNavigate();
  const { speak } = usePreferences();
  const help = useMutation({
    mutationFn: () => api.post('/help-requests', { context: 'Pidió ayuda desde la pantalla Ayuda' }),
    onSuccess: () => speak('Listo. Avisamos a tu familia. Mientras tanto, busca a un adulto cerca de ti.'),
  });

  const spoken = `¿Cómo juego? ${HOW.map((h) => `${h.title}. ${h.text}`).join(' ')}`;

  return (
    <div className="page help">
      <header className="page-head">
        <div>
          <h1>¿Cómo puedo ayudarte?</h1>
          <p className="lead">Siempre puedes preguntar. Elige una opción.</p>
        </div>
        <Nubi size={120} />
      </header>

      <div className="help-grid">
        <button type="button" className="help-option" onClick={() => speak(spoken)}>
          <img src={asset('picto_escuchar')} alt="" />
          <strong>Escuchar cómo juego</strong>
          <span>Nubi te explica los pasos.</span>
        </button>
        <button type="button" className="help-option" onClick={() => navigate('/tutorial')}>
          <img src={asset('picto_nino')} alt="" />
          <strong>Ver el tutorial</strong>
          <span>Repite los tres pasos con Nubi.</span>
        </button>
        <button
          type="button"
          className={`help-option help-option--alert ${help.isSuccess ? 'is-done' : ''}`}
          onClick={() => help.mutate()}
          disabled={help.isPending || help.isSuccess}
        >
          <img src={asset('picto_familia')} alt="" />
          <strong>{help.isSuccess ? 'Avisamos a tu familia' : 'Necesito ayuda'}</strong>
          <span>{help.isSuccess ? 'Busca a un adulto cerca de ti.' : 'Avisa a un adulto de tu familia.'}</span>
          {help.isSuccess && <Check aria-hidden="true" className="help-option__check" />}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {help.isSuccess ? 'Avisamos a tu familia.' : ''}
      </p>
      {help.error && (
        <p className="notice notice--encourage" role="alert">
          {help.error.message}
        </p>
      )}

      <section aria-labelledby="como-juego" className="card">
        <div className="section-head">
          <h2 id="como-juego">¿Cómo juego?</h2>
          <SpeakButton text={spoken} />
        </div>
        <ol className="how-steps">
          {HOW.map((h, i) => (
            <li key={h.title}>
              <img src={asset(h.image)} alt="" />
              <div>
                <strong>
                  {i + 1}. {h.title}
                </strong>
                <p>{h.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="q-actions q-actions--center">
        <Button variant="secondary" size="lg" onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/inicio'))}>
          Volver a donde estaba
        </Button>
      </div>
    </div>
  );
}
