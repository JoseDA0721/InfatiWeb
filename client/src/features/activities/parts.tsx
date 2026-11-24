import { ArrowRight, Check, Lightbulb, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { SpeakButton } from '../../components/SpeakButton';
import { Stars } from '../../components/Stars';
import { asset } from '../../lib/assets';
import type { AnswerResult, QuestionBase } from '../../lib/types';
import type { Phase } from './useQuestionFlow';

/** Escena ilustrada de la pregunta, con lupa opcional (Observa la expresión). */
export function Scene({ question, zoomable = false }: { question: QuestionBase; zoomable?: boolean }) {
  const [zoom, setZoom] = useState(false);
  const src = asset(question.scene);
  if (!src) return null;
  return (
    <figure className={`scene ${zoom ? 'is-zoomed' : ''}`}>
      <div className="scene__frame">
        <img src={src} alt={question.sceneAlt ?? ''} />
      </div>
      {zoomable && (
        <button type="button" className="scene__zoom btn btn--soft btn--md" onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>
          {zoom ? <ZoomOut aria-hidden="true" className="btn__icon" /> : <ZoomIn aria-hidden="true" className="btn__icon" />}
          <span className="btn__label">{zoom ? 'Ver normal' : 'Ver más grande'}</span>
        </button>
      )}
    </figure>
  );
}

/** Área fija de pistas junto a la pregunta: nunca tapa el enunciado ni las opciones. */
export function HintPanel({
  question,
  shown,
  onShow,
  disabled,
}: {
  question: QuestionBase;
  shown: number;
  onShow: (text: string | null) => void;
  disabled: boolean;
}) {
  const hints = [question.hint1, question.hint2].filter(Boolean) as string[];
  if (hints.length === 0) return null;
  const visible = hints.slice(0, shown);
  const nextHint = hints[shown] ?? null;
  return (
    <aside className="hint" aria-labelledby={`pista-${question.id}`}>
      <h2 id={`pista-${question.id}`} className="hint__title">
        <Lightbulb aria-hidden="true" /> Pistas
      </h2>
      {visible.length === 0 ? (
        <p className="hint__empty">Si lo necesitas, pide una pista. ¡Pedir ayuda está bien!</p>
      ) : (
        <ol className="hint__list" aria-live="polite">
          {visible.map((h, i) => (
            <li key={i}>
              <span className="hint__num num" aria-hidden="true">
                {i + 1}
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="hint__actions">
        {nextHint && (
          <Button variant="soft" disabled={disabled} onClick={() => onShow(nextHint)}>
            {shown === 0 ? 'Ver una pista' : 'Otra pista'}
          </Button>
        )}
        {visible.length > 0 && <SpeakButton text={visible.join('. ')} label="Escuchar pista" />}
      </div>
    </aside>
  );
}

/** Retroalimentación amable (aria-live). Bombilla en lugar de una «equis». */
export function Feedback({ result }: { result: AnswerResult | null }) {
  return (
    <div className="feedback-region" aria-live="polite">
      {result && (
        <div className={`feedback ${result.correct ? 'feedback--success' : 'feedback--encourage'}`}>
          <span className="feedback__icon" aria-hidden="true">
            {result.correct ? <Check /> : <Lightbulb />}
          </span>
          <div className="feedback__body">
            <p className="feedback__title">{result.title}</p>
            {result.strategy && <p>{result.strategy}</p>}
            {result.message && result.message !== result.strategy && <p>{result.message}</p>}
            {!result.resolved && result.hint && (
              <p>
                <strong>Pista:</strong> {result.hint}
              </p>
            )}
            {result.askForHelp && <p className="feedback__help">{result.askForHelp}</p>}
          </div>
          {result.resolved && result.stars !== undefined && <Stars count={result.stars} animate />}
        </div>
      )}
    </div>
  );
}

/** Un solo botón principal por pantalla: Comprobar → Intentar otra vez → Siguiente. */
export function QuestionActions({
  phase,
  canCheck,
  pending,
  onCheck,
  onRetry,
  onNext,
  isLast,
  checkLabel = 'Comprobar',
}: {
  phase: Phase;
  canCheck: boolean;
  pending: boolean;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
  isLast: boolean;
  checkLabel?: string;
}) {
  return (
    <div className="q-actions">
      {phase === 'answering' && (
        <Button variant="primary" size="xl" onClick={onCheck} disabled={!canCheck || pending}>
          {pending ? 'Revisando…' : checkLabel}
        </Button>
      )}
      {phase === 'retry' && (
        <Button variant="primary" size="xl" icon={<RotateCcw aria-hidden="true" className="btn__icon" />} onClick={onRetry} autoFocus>
          Intentar otra vez
        </Button>
      )}
      {phase === 'resolved' && (
        <Button variant="primary" size="xl" iconEnd={<ArrowRight aria-hidden="true" className="btn__icon" />} onClick={onNext} autoFocus>
          {isLast ? 'Terminar' : 'Siguiente'}
        </Button>
      )}
    </div>
  );
}

export function QuestionPrompt({ question, children }: { question: QuestionBase; children?: ReactNode }) {
  return (
    <div className="prompt">
      <h1 className="prompt__text">{question.prompt}</h1>
      <SpeakButton text={question.story ? `${question.story} ${question.prompt}` : question.prompt} size="lg" />
      {children}
    </div>
  );
}
