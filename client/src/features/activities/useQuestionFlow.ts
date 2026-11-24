import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';
import type { AnswerResult } from '../../lib/types';
import { usePreferences } from '../preferences/PreferencesContext';

export type Phase = 'answering' | 'retry' | 'resolved';

/**
 * Flujo de una pregunta: marcar → Comprobar → acierto (estrellas) o ánimo con pista.
 * Nunca reinicia la actividad ni resta puntos.
 */
export function useQuestionFlow(attemptId: number, questionId: number, onResolved: (stars: number) => void) {
  const { speak, cue } = usePreferences();
  const [hintsShown, setHintsShown] = useState(0);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<AnswerResult>(`/attempts/${attemptId}/answers`, { questionId, hintsUsed: hintsShown, ...payload }),
    onSuccess: (data) => {
      setResult(data);
      if (data.resolved) {
        setPhase('resolved');
        cue(data.correct ? 'success' : 'encourage');
        speak([data.title, data.strategy, data.message].filter(Boolean).join('. '));
        onResolved(data.stars ?? 1);
      } else {
        setPhase('retry');
        cue('encourage');
        if (data.hintLevel) setHintsShown((h) => Math.max(h, data.hintLevel!));
        speak([data.title, data.message, data.hint ? `Pista: ${data.hint}` : null].filter(Boolean).join('. '));
      }
    },
  });

  return {
    phase,
    result,
    hintsShown,
    pending: mutation.isPending,
    error: mutation.error,
    submit: (payload: Record<string, unknown>) => mutation.mutate(payload),
    showHint: (text: string | null) => {
      setHintsShown((h) => Math.min(2, h + 1));
      if (text) speak(`Pista: ${text}`);
    },
    retry: () => {
      setPhase('answering');
    },
  };
}
