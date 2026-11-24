import { Check, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SpeakButton } from '../../components/SpeakButton';
import { asset } from '../../lib/assets';
import type { ActivityType, ChoiceQuestion as ChoiceQuestionType } from '../../lib/types';
import { useAutoRead, usePreferences } from '../preferences/PreferencesContext';
import { Feedback, HintPanel, QuestionActions, QuestionPrompt, Scene } from './parts';
import { useQuestionFlow } from './useQuestionFlow';

interface Props {
  type: ActivityType;
  question: ChoiceQuestionType;
  attemptId: number;
  isLast: boolean;
  onResolved: (stars: number) => void;
  onNext: () => void;
}

/** Identifica la emoción, Observa la expresión, Escucha y responde y ¿Qué harías? */
export function ChoiceQuestion({ type, question, attemptId, isLast, onResolved, onNext }: Props) {
  const flow = useQuestionFlow(attemptId, question.id, onResolved);
  const { cue, speak } = usePreferences();
  const [selected, setSelected] = useState<number | null>(null);
  const [tried, setTried] = useState<number[]>([]);
  const isListen = type === 'escucha';
  const isStrategy = type === 'que_harias';
  const locked = flow.phase === 'resolved' || flow.pending;

  // «Escucha y responde»: el audio es parte de la pregunta. «Identifica»: se lee si el modo lo pide.
  useAutoRead(isListen ? `${question.story} ${question.prompt}` : question.prompt);

  function choose(id: number) {
    if (locked) return;
    // Tras un intento, tocar otra opción ya cuenta como «intentar otra vez».
    if (flow.phase === 'retry') {
      if (selected !== null) setTried((t) => (t.includes(selected) ? t : [...t, selected]));
      flow.retry();
    }
    setSelected(id);
    cue('select');
    const option = question.options.find((o) => o.id === id);
    if (option) speak(option.label);
  }

  // Atajos 1, 2, 3 para las opciones.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('dialog')) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < question.options.length) choose(question.options[index].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function check() {
    if (selected === null) return;
    flow.submit({ optionId: selected });
  }

  function retry() {
    if (selected !== null) setTried((t) => [...t, selected]);
    setSelected(null);
    flow.retry();
  }

  const correctIds = new Set(
    flow.result?.correctOptionIds ?? (flow.result?.correct && selected !== null ? [selected] : []),
  );

  return (
    <div className={`question question--${type}`}>
      <div className="question__main">
        <div className="question__card">
          {isListen && question.story && (
            <div className="story">
              <SpeakButton text={question.story} label="Escuchar la historia" size="lg" className="story__play" />
              <p className="story__label">Lo que escuchaste:</p>
              <p className="story__text">{question.story}</p>
            </div>
          )}
          <Scene question={question} zoomable={type === 'observa'} />
          <QuestionPrompt question={question} />
        </div>
        <HintPanel question={question} shown={flow.hintsShown} onShow={flow.showHint} disabled={flow.phase === 'resolved'} />
      </div>

      <fieldset className="answers">
        <legend className="answers__legend">{isStrategy ? 'Elige una idea' : type === 'escucha' && !question.options[0]?.emotion ? 'Elige una respuesta' : 'Elige una emoción'}</legend>
        <div className={`answers__grid ${isStrategy || !question.options[0]?.emotion ? 'answers__grid--text' : ''}`}>
          {question.options.map((option, index) => {
            const isSelected = selected === option.id;
            const isCorrect = flow.phase === 'resolved' && correctIds.has(option.id);
            const wasTried = tried.includes(option.id) || (flow.phase === 'retry' && isSelected);
            const state = isCorrect ? 'is-correct' : wasTried ? 'is-tried' : isSelected ? 'is-selected' : '';
            const face = option.emotion ? asset(`emo_${option.emotion}`) : asset(option.image);
            return (
              <button
                key={option.id}
                type="button"
                className={`answer ${state} ${option.emotion ? `answer--${option.emotion}` : ''}`}
                aria-pressed={isSelected}
                aria-keyshortcuts={String(index + 1)}
                disabled={flow.phase === 'resolved' && !isSelected && !isCorrect}
                onClick={() => choose(option.id)}
              >
                <span className="answer__num num" aria-hidden="true">
                  {index + 1}
                </span>
                {face && <img className="answer__img" src={face} alt="" />}
                <span className="answer__label">{option.label}</span>
                {isCorrect && (
                  <span className="answer__tag answer__tag--ok">
                    <Check aria-hidden="true" /> {isStrategy ? '¡Ayuda!' : '¡Esa es!'}
                  </span>
                )}
                {!isCorrect && wasTried && (
                  <span className="answer__tag answer__tag--try">
                    <Lightbulb aria-hidden="true" /> Probemos otra
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Feedback result={flow.result} />
      {flow.error && <p className="notice notice--encourage" role="alert">{flow.error.message}</p>}
      <QuestionActions
        phase={flow.phase}
        canCheck={selected !== null}
        pending={flow.pending}
        onCheck={check}
        onRetry={retry}
        onNext={onNext}
        isLast={isLast}
      />
    </div>
  );
}
