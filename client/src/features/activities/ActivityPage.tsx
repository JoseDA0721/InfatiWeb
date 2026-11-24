import { useMutation, useQuery } from '@tanstack/react-query';
import { CircleHelp, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Nubi } from '../../components/Nubi';
import { SpeakButton } from '../../components/SpeakButton';
import { ErrorState, LoadingState } from '../../components/States';
import { useOverrideBack } from '../../layouts/BackContext';
import { api } from '../../lib/api';
import { asset } from '../../lib/assets';
import { keys, useInvalidateProgress, useSession } from '../../lib/queries';
import type { Activity, ChoiceQuestion as ChoiceQ, ExpressQuestion as ExpressQ, FinishResult, PairQuestion as PairQ } from '../../lib/types';
import { useAutoRead } from '../preferences/PreferencesContext';
import { Breathing } from './Breathing';
import { Celebration } from './Celebration';
import { ChoiceQuestion } from './ChoiceQuestion';
import { ExpressQuestion } from './ExpressQuestion';
import { PairQuestion } from './PairQuestion';
import { STEPS } from './steps';
import './activity.css';

interface StartResult {
  attemptId: number;
  resumed: boolean;
  resolved: { questionId: number; stars: number }[];
}

function Intro({ activity, onStart, starting, error }: { activity: Activity; onStart: () => void; starting: boolean; error?: string }) {
  const steps = STEPS[activity.type];
  const spoken = `${activity.title}. ${activity.instruction} ${steps.map((s, i) => `Paso ${i + 1}: ${s.title}. ${s.text}`).join(' ')}`;
  useAutoRead(spoken);
  return (
    <section className="intro" aria-labelledby="intro-title">
      <header className="page-head">
        <div>
          <p className="chip">{activity.typeLabel}</p>
          <h1 id="intro-title">{activity.title}</h1>
          <p className="lead">{activity.instruction}</p>
        </div>
        <SpeakButton text={spoken} size="lg" />
      </header>
      <ol className="intro__steps">
        {steps.map((step, i) => (
          <li key={step.title} className="intro__step">
            <span className="intro__num num" aria-hidden="true">
              {i + 1}
            </span>
            <img src={asset(step.image)} alt="" />
            <h2>
              <span className="sr-only">Paso {i + 1}: </span>
              {step.title}
            </h2>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      {error && (
        <p className="notice notice--encourage" role="alert">
          {error}
        </p>
      )}
      <div className="q-actions q-actions--center">
        <Button variant="primary" size="xl" onClick={onStart} disabled={starting}>
          {starting ? 'Preparando…' : '¡Empezar!'}
        </Button>
      </div>
    </section>
  );
}

function HowToPlay({ activity, open, onClose }: { activity: Activity; open: boolean; onClose: () => void }) {
  const steps = STEPS[activity.type];
  return (
    <Modal open={open} onClose={onClose} title="¿Cómo juego?">
      <ol className="howto">
        {steps.map((s, i) => (
          <li key={s.title}>
            <img src={asset(s.image)} alt="" />
            <div>
              <strong>
                {i + 1}. {s.title}
              </strong>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <SpeakButton text={steps.map((s, i) => `Paso ${i + 1}: ${s.title}. ${s.text}`).join(' ')} />
      <Button variant="primary" size="lg" block onClick={onClose}>
        Seguir jugando
      </Button>
    </Modal>
  );
}

export function ActivityPage() {
  const { activityId } = useParams();
  const id = Number(activityId);
  const navigate = useNavigate();
  const session = useSession();
  const invalidate = useInvalidateProgress();
  const [attempt, setAttempt] = useState<StartResult | null>(null);
  const [index, setIndex] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [finished, setFinished] = useState<FinishResult | null>(null);

  const activity = useQuery({ queryKey: keys.activity(id), queryFn: () => api.get<Activity>(`/activities/${id}`), enabled: Number.isFinite(id) });

  useOverrideBack(() => (attempt && !finished ? setExitOpen(true) : navigate('/mapa')));

  const start = useMutation({
    mutationFn: () => api.post<StartResult>('/attempts', { activityId: id }),
    onSuccess: (data) => {
      setAttempt(data);
      const done = new Set(data.resolved.map((r) => r.questionId));
      const first = activity.data!.questions.findIndex((q) => !done.has(q.id));
      setIndex(first === -1 ? Math.max(0, activity.data!.questions.length - 1) : first);
    },
  });

  const finish = useMutation({
    mutationFn: () => api.post<FinishResult>(`/attempts/${attempt!.attemptId}/finish`),
    onSuccess: (data) => {
      setFinished(data);
      void invalidate();
    },
  });

  if (activity.isPending) return <LoadingState label="Preparando la actividad…" />;
  if (activity.error) {
    return <ErrorState message={activity.error.message} onRetry={() => navigate('/mapa')} actionLabel="Ir al mapa" />;
  }

  const data = activity.data;
  const questions = data.questions;
  const childName = session.data?.child?.name ?? '';
  const total = questions.length;
  const resolvedCount = attempt ? Math.min(index, total) : 0;

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finish.mutate();
    }
  }

  const question = questions[index];
  const common = {
    attemptId: attempt?.attemptId ?? 0,
    isLast: index === total - 1,
    onResolved: () => {},
    onNext: next,
  };

  return (
    <div className="page activity">
      {!attempt ? (
        <Intro activity={data} onStart={() => start.mutate()} starting={start.isPending} error={start.error?.message} />
      ) : (
        <>
          <div className="activity__bar">
            {total > 0 ? (
              <div className="progress-path" aria-label={`Pregunta ${index + 1} de ${total}`} role="img">
                <span className="progress-path__label num" aria-hidden="true">
                  Pregunta {index + 1} de {total}
                </span>
                <ol className="progress-path__stops" aria-hidden="true">
                  {questions.map((q, i) => (
                    <li key={q.id} className={i < resolvedCount ? 'is-done' : i === index ? 'is-now' : ''}>
                      {i === index ? <Nubi size={34} /> : <span className="num">{i + 1}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="progress-path__label">{data.title}</p>
            )}
            <div className="activity__tools">
              <Button variant="ghost" icon={<CircleHelp aria-hidden="true" className="btn__icon" />} onClick={() => setHowOpen(true)}>
                ¿Cómo juego?
              </Button>
              <Button variant="danger" icon={<LogOut aria-hidden="true" className="btn__icon" />} onClick={() => setExitOpen(true)}>
                Salir
              </Button>
            </div>
          </div>
          {attempt.resumed && index > 0 && index === questions.findIndex((q) => !attempt.resolved.some((r) => r.questionId === q.id)) && (
            <p className="notice notice--info">Seguimos donde te quedaste. ¡Tu avance estaba guardado!</p>
          )}

          {data.type === 'respira' ? (
            <Breathing onFinish={() => finish.mutate()} finishing={finish.isPending} />
          ) : data.type === 'une' ? (
            <PairQuestion key={question.id} question={question as PairQ} {...common} />
          ) : data.type === 'expreso' ? (
            <ExpressQuestion key={question.id} question={question as ExpressQ} {...common} />
          ) : (
            <ChoiceQuestion key={question.id} type={data.type} question={question as ChoiceQ} {...common} />
          )}
          {finish.error && (
            <p className="notice notice--encourage" role="alert">
              {finish.error.message}
            </p>
          )}
        </>
      )}

      <Modal open={exitOpen} onClose={() => setExitOpen(false)} title="¿Quieres salir?" hideClose>
        <div className="stack center-text">
          <Nubi size={110} className="center" />
          <p className="lead">Tu avance se guarda para que puedas continuar después.</p>
          <Button variant="primary" size="lg" block onClick={() => setExitOpen(false)} autoFocus>
            Seguir jugando
          </Button>
          <Button variant="secondary" size="lg" block onClick={() => navigate('/mapa')}>
            Guardar y salir
          </Button>
        </div>
      </Modal>

      <HowToPlay activity={data} open={howOpen} onClose={() => setHowOpen(false)} />

      {finished && <Celebration result={finished} childName={childName} onClose={() => setFinished(null)} />}
    </div>
  );
}

/** Una instancia nueva por actividad: al pasar a «Otra actividad» el estado empieza limpio. */
export function ActivityRoute() {
  const { activityId } = useParams();
  return <ActivityPage key={activityId} />;
}
