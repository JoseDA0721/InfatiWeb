import { Check, Lightbulb, X } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { asset } from '../../lib/assets';
import { EMOTIONS } from '../../lib/format';
import type { Emotion, PairQuestion as PairQuestionType } from '../../lib/types';
import { useAutoRead, usePreferences } from '../preferences/PreferencesContext';
import { Feedback, HintPanel, QuestionActions, QuestionPrompt } from './parts';
import { useQuestionFlow } from './useQuestionFlow';

interface Props {
  question: PairQuestionType;
  attemptId: number;
  isLast: boolean;
  onResolved: (stars: number) => void;
  onNext: () => void;
}

/**
 * Une las emociones: arrastrar la emoción a la situación o, como alternativa
 * táctil y de teclado, tocar la situación y luego la emoción.
 */
export function PairQuestion({ question, attemptId, isLast, onResolved, onNext }: Props) {
  const flow = useQuestionFlow(attemptId, question.id, onResolved);
  const { cue, speak } = usePreferences();
  const [pairs, setPairs] = useState<Record<number, Emotion>>({});
  const [activeItem, setActiveItem] = useState<number | null>(question.items[0]?.id ?? null);
  const [locked, setLocked] = useState<Set<number>>(new Set());
  useAutoRead(question.prompt);

  const resolved = flow.phase === 'resolved';
  const results = new Map(flow.result?.pairResults?.map((r) => [r.itemId, r.correct]) ?? []);
  const shown: Record<number, Emotion> = resolved && flow.result?.correctPairs
    ? Object.fromEntries(flow.result.correctPairs.map((p) => [p.itemId, p.emotion]))
    : pairs;

  function prepareForEdit() {
    if (flow.phase !== 'retry') return;
    // Las parejas correctas quedan fijas; las demás se pueden cambiar.
    const keep = new Set([...locked, ...[...results.entries()].filter(([, ok]) => ok).map(([id]) => id)]);
    setLocked(keep);
    setPairs((p) => Object.fromEntries(Object.entries(p).filter(([id]) => keep.has(Number(id)))) as Record<number, Emotion>);
    setActiveItem(question.items.find((i) => !keep.has(i.id))?.id ?? null);
    flow.retry();
  }

  function assign(itemId: number, emotion: Emotion) {
    if (resolved || flow.pending || locked.has(itemId) || (flow.phase === 'retry' && results.get(itemId))) return;
    prepareForEdit();
    setPairs((p) => ({ ...p, [itemId]: emotion }));
    cue('select');
    const item = question.items.find((i) => i.id === itemId);
    speak(`${item?.label}: ${EMOTIONS[emotion].label}`);
    const nextFree = question.items.find((i) => i.id !== itemId && !pairs[i.id] && !locked.has(i.id));
    setActiveItem(nextFree?.id ?? null);
  }

  function selectItem(itemId: number) {
    if (resolved || locked.has(itemId)) return;
    setActiveItem(itemId);
    const item = question.items.find((i) => i.id === itemId);
    if (item) speak(item.label);
  }

  function unassign(itemId: number) {
    if (resolved || locked.has(itemId)) return;
    prepareForEdit();
    setPairs((p) => {
      const next = { ...p };
      delete next[itemId];
      return next;
    });
    setActiveItem(itemId);
  }

  const allPaired = question.items.every((i) => pairs[i.id]);
  const onDrop = (itemId: number) => (event: DragEvent) => {
    event.preventDefault();
    const emotion = event.dataTransfer.getData('text/plain') as Emotion;
    if (emotion) assign(itemId, emotion);
  };

  return (
    <div className="question question--une">
      <div className="question__main">
        <div className="question__card">
          <QuestionPrompt question={question} />
          <p className="pairs__how">Toca una situación y luego su emoción. También puedes arrastrar la cara.</p>
        </div>
        <HintPanel question={question} shown={flow.hintsShown} onShow={flow.showHint} disabled={resolved} />
      </div>

      <div className="pairs">
        <ol className="pairs__items" aria-label="Situaciones">
          {question.items.map((item, index) => {
            const emotion = shown[item.id];
            const ok = results.get(item.id);
            const fixed = locked.has(item.id) || resolved || (flow.phase === 'retry' && ok === true);
            const state = resolved || (flow.phase === 'retry' && ok) || locked.has(item.id) ? 'is-correct' : flow.phase === 'retry' && ok === false ? 'is-tried' : '';
            return (
              <li
                key={item.id}
                className={`pair ${activeItem === item.id && !fixed ? 'is-active' : ''} ${state}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop(item.id)}
              >
                <button
                  type="button"
                  className="pair__situation"
                  aria-pressed={activeItem === item.id}
                  disabled={fixed}
                  onClick={() => selectItem(item.id)}
                >
                  <span className="pair__num num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{item.label}</span>
                </button>
                <span className={`pair__slot ${emotion ? 'is-filled' : ''}`} aria-live="polite">
                  {emotion ? (
                    <>
                      <img src={asset(EMOTIONS[emotion].face)} alt="" />
                      <span>{EMOTIONS[emotion].label}</span>
                      {state === 'is-correct' && <Check aria-hidden="true" className="pair__mark" />}
                      {state === 'is-tried' && <Lightbulb aria-hidden="true" className="pair__mark" />}
                      {!fixed && (
                        <button type="button" className="pair__clear" onClick={() => unassign(item.id)} aria-label={`Quitar ${EMOTIONS[emotion].label} de «${item.label}»`}>
                          <X aria-hidden="true" />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="pair__empty">Suelta una emoción aquí</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="pairs__emotions" role="group" aria-label="Emociones">
          {question.emotions.map((e) => (
            <button
              key={e.code}
              type="button"
              className={`emotion-chip emotion-chip--${e.code}`}
              draggable={!resolved}
              onDragStart={(event) => event.dataTransfer.setData('text/plain', e.code)}
              disabled={resolved || activeItem === null}
              onClick={() => activeItem !== null && assign(activeItem, e.code)}
              aria-label={activeItem !== null ? `Unir ${e.label} con «${question.items.find((i) => i.id === activeItem)?.label}»` : e.label}
            >
              <img src={asset(EMOTIONS[e.code].face)} alt="" />
              <span>{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Feedback result={flow.result} />
      {flow.error && <p className="notice notice--encourage" role="alert">{flow.error.message}</p>}
      <QuestionActions
        phase={flow.phase}
        canCheck={allPaired}
        pending={flow.pending}
        onCheck={() => flow.submit({ pairs: question.items.map((i) => ({ itemId: i.id, emotion: pairs[i.id] })) })}
        onRetry={prepareForEdit}
        onNext={onNext}
        isLast={isLast}
      />
    </div>
  );
}
