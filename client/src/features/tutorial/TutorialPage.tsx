import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { Nubi } from '../../components/Nubi';
import { SoundControl } from '../../components/SoundControl';
import { SpeakButton } from '../../components/SpeakButton';
import { api } from '../../lib/api';
import { asset } from '../../lib/assets';
import { keys } from '../../lib/queries';
import type { Session } from '../../lib/types';
import { useAutoRead } from '../preferences/PreferencesContext';
import './tutorial.css';

const STEPS = [
  {
    title: 'Elige una aventura',
    text: 'Recorre el mapa y toca una estación abierta para empezar a jugar.',
    art: 'tutorial_mapa',
    alt: 'Un camino de colores con estaciones entre colinas, como un mapa de aventuras',
  },
  {
    title: 'Gana estrellas mientras aprendes',
    text: 'Cada intento cuenta. Aquí nunca pierdes estrellas por equivocarte.',
    art: 'tutorial_estrellas',
    alt: 'Una niña salta feliz atrapando estrellas doradas',
  },
  {
    title: 'Pide ayuda cuando la necesites',
    text: 'El botón Escuchar lee todo en voz alta. El botón Ayuda está siempre arriba.',
    art: 'tutorial_ayuda',
    alt: 'Un niño levanta la mano para pedir ayuda y su abuela se acerca a escucharlo',
  },
];

export function TutorialPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  useAutoRead(`${current.title}. ${current.text}`);

  const finish = useMutation({
    mutationFn: () => api.post('/me/tutorial'),
    onSettled: () => {
      client.setQueryData<Session>(keys.session, (s) => (s?.child ? { ...s, child: { ...s.child, tutorialDone: true } } : s));
      navigate('/inicio', { replace: true });
    },
  });

  return (
    <main className="tutorial" id="contenido">
      <header className="tutorial__top">
        <Logo size="sm" />
        <div className="tutorial__tools">
          <SoundControl />
          <Button variant="ghost" onClick={() => finish.mutate()}>
            Omitir tutorial
          </Button>
        </div>
      </header>

      <div className="tutorial__stage" key={step}>
        <div className="tutorial__art">
          <img src={asset(current.art)} alt={current.alt} className="tutorial__picture" />
          <Nubi size={120} stage={step === 1 ? 2 : 1} float className="tutorial__nubi" />
        </div>
        <p className="tutorial__step num">Paso {step + 1} de 3</p>
        <h1 className="tutorial__title" aria-live="polite">
          {current.title}
        </h1>
        <p className="tutorial__text">{current.text}</p>
        <SpeakButton text={`${current.title}. ${current.text}`} />
      </div>

      <div className="tutorial__dots" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s.title} className={i === step ? 'is-active' : i < step ? 'is-done' : ''} />
        ))}
      </div>

      <div className="tutorial__actions">
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)}>
            Anterior
          </Button>
        )}
        <Button
          variant="primary"
          size="xl"
          iconEnd={<ArrowRight aria-hidden="true" className="btn__icon" />}
          onClick={() => (step < STEPS.length - 1 ? setStep((s) => s + 1) : finish.mutate())}
          disabled={finish.isPending}
        >
          {step < STEPS.length - 1 ? 'Siguiente' : '¡Vamos a jugar!'}
        </Button>
      </div>
    </main>
  );
}
