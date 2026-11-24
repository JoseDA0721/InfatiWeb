import { useState } from 'react';
import { SpeakButton } from '../../components/SpeakButton';
import { asset } from '../../lib/assets';
import type { ExpressQuestion as ExpressQuestionType } from '../../lib/types';
import { useAutoRead, usePreferences } from '../preferences/PreferencesContext';
import { Feedback, QuestionActions, QuestionPrompt } from './parts';
import { useQuestionFlow } from './useQuestionFlow';

type Intensity = 'poquito' | 'algo' | 'mucho';

const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: 'poquito', label: 'Un poquito' },
  { id: 'algo', label: 'Algo' },
  { id: 'mucho', label: 'Mucho' },
];

const FEMININE = new Set(['alegria', 'tristeza', 'sorpresa']);

function sentence(emotion?: { code: string; label: string }, reason?: string, intensity?: Intensity) {
  if (!emotion) return 'Siento…';
  const noun = emotion.label.toLowerCase();
  const amount = !intensity
    ? ''
    : intensity === 'poquito'
      ? 'un poquito de '
      : intensity === 'algo'
        ? 'algo de '
        : FEMININE.has(emotion.code)
          ? 'mucha '
          : 'mucho ';
  const why = reason ? ` porque ${reason.charAt(0).toLowerCase()}${reason.slice(1)}` : ' porque…';
  return `Siento ${amount}${noun}${why}.`.replace('….', '…');
}

interface Props {
  question: ExpressQuestionType;
  attemptId: number;
  isLast: boolean;
  onResolved: (stars: number) => void;
  onNext: () => void;
}

/** Expreso lo que siento: pictogramas para armar «Siento… porque…» y la intensidad. Sin escritura libre. */
export function ExpressQuestion({ question, attemptId, isLast, onResolved, onNext }: Props) {
  const flow = useQuestionFlow(attemptId, question.id, onResolved);
  const { cue, speak } = usePreferences();
  const [emotionId, setEmotionId] = useState<number | null>(null);
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  useAutoRead(question.prompt);

  const emotion = question.emotions.find((e) => e.id === emotionId);
  const reason = question.reasons.find((r) => r.id === reasonId);
  const text = sentence(emotion, reason?.label, intensity ?? undefined);
  const done = flow.phase === 'resolved';

  function pick<T>(setter: (v: T) => void, value: T, spoken: string) {
    if (done) return;
    setter(value);
    cue('select');
    speak(spoken);
  }

  return (
    <div className="question question--expreso">
      <div className="question__card">
        <QuestionPrompt question={question} />
      </div>

      <fieldset className="express-step">
        <legend>1. Me siento…</legend>
        <div className="express-grid express-grid--emotions">
          {question.emotions.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`express-option answer--${e.code} ${emotionId === e.id ? 'is-selected' : ''}`}
              aria-pressed={emotionId === e.id}
              disabled={done}
              onClick={() => pick(setEmotionId, e.id, e.label)}
            >
              <img src={asset(e.image)} alt="" />
              <span>{e.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="express-step">
        <legend>2. Porque…</legend>
        <div className="express-grid express-grid--reasons">
          {question.reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`express-option express-option--reason ${reasonId === r.id ? 'is-selected' : ''}`}
              aria-pressed={reasonId === r.id}
              disabled={done}
              onClick={() => pick(setReasonId, r.id, r.label)}
            >
              <img src={asset(r.image)} alt="" />
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="express-step">
        <legend>3. ¿Cuánto lo sientes?</legend>
        <div className="intensity">
          {INTENSITIES.map((level, i) => (
            <button
              key={level.id}
              type="button"
              className={`intensity__option ${intensity === level.id ? 'is-selected' : ''}`}
              aria-pressed={intensity === level.id}
              disabled={done}
              onClick={() => pick(setIntensity, level.id, level.label)}
            >
              <span className="intensity__dot" style={{ '--size': `${1 + i * 0.75}rem` } as React.CSSProperties} aria-hidden="true" />
              <span>{level.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="sentence" aria-live="polite">
        <p className="sentence__label">Mi frase</p>
        <p className="sentence__text">{text}</p>
        {emotion && reason && intensity && <SpeakButton text={text} label="Escuchar mi frase" />}
      </div>

      <Feedback result={flow.result} />
      <QuestionActions
        phase={flow.phase}
        canCheck={Boolean(emotion && reason && intensity)}
        pending={flow.pending}
        onCheck={() => flow.submit({ emotionOptionId: emotionId, reasonOptionId: reasonId, intensity })}
        onRetry={flow.retry}
        onNext={onNext}
        isLast={isLast}
        checkLabel="Guardar mi frase"
      />
    </div>
  );
}
