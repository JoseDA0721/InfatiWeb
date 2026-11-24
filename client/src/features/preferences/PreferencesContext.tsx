import { useQuery } from '@tanstack/react-query';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '../../lib/api';
import { keys, useSession } from '../../lib/queries';
import { playCue } from '../../lib/sound';
import { speak as speakText, stopSpeaking } from '../../lib/speech';
import type { Preferences } from '../../lib/types';

export const DEFAULT_PREFERENCES: Preferences = {
  fontScale: 'normal',
  highContrast: false,
  volume: 0.6,
  muted: false,
  voiceRate: 0.9,
  readMode: 'ambos',
  reduceMotion: false,
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface PreferencesContextValue {
  prefs: Preferences;
  update: (patch: Partial<Preferences>) => void;
  saveState: SaveState;
  speak: (text: string, id?: string) => boolean;
  stop: () => void;
  cue: (name: Parameters<typeof playCue>[0]) => void;
  /** Lectura automática al entrar a una pantalla (modos «audio» y «ambos»). */
  autoRead: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const LOCAL_KEY = 'infantiweb:preferencias';

function readLocal(): Preferences {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writeLocal(prefs: Preferences) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(prefs));
  } catch {
    /* almacenamiento no disponible: los ajustes duran esta visita */
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const childId = session.data?.child?.id ?? null;
  const [prefs, setPrefs] = useState<Preferences>(readLocal);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const timer = useRef<number | undefined>(undefined);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  // Con un niño en sesión, sus ajustes vienen de la base de datos.
  const remote = useQuery({
    queryKey: [...keys.preferences, childId],
    queryFn: () => api.get<Preferences>('/me/preferences'),
    enabled: childId !== null,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (remote.data) {
      setPrefs(remote.data);
      writeLocal(remote.data);
    }
  }, [remote.data]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.font = prefs.fontScale;
    root.dataset.contrast = prefs.highContrast ? 'alto' : 'normal';
    root.dataset.motion = prefs.reduceMotion ? 'reducido' : 'normal';
  }, [prefs.fontScale, prefs.highContrast, prefs.reduceMotion]);

  const update = useCallback(
    (patch: Partial<Preferences>) => {
      const next = { ...prefsRef.current, ...patch };
      setPrefs(next);
      writeLocal(next);
      if (childId === null) {
        setSaveState('saved');
        return;
      }
      setSaveState('saving');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        api
          .put<Preferences>('/me/preferences', next)
          .then(() => setSaveState('saved'))
          .catch(() => setSaveState('error'));
      }, 350);
    },
    [childId],
  );

  const speak = useCallback((text: string, id?: string) => {
    const p = prefsRef.current;
    return speakText(text, { volume: p.volume, rate: p.voiceRate, muted: p.muted, id });
  }, []);

  const cue = useCallback((name: Parameters<typeof playCue>[0]) => {
    const p = prefsRef.current;
    playCue(name, p.volume, p.muted);
  }, []);

  useEffect(() => {
    if (prefs.muted) stopSpeaking();
  }, [prefs.muted]);

  const value = useMemo<PreferencesContextValue>(
    () => ({ prefs, update, saveState, speak, stop: stopSpeaking, cue, autoRead: prefs.readMode !== 'texto' && !prefs.muted }),
    [prefs, update, saveState, speak, cue],
  );

  return <PreferencesContext value={value}>{children}</PreferencesContext>;
}

export function usePreferences() {
  const ctx = use(PreferencesContext);
  if (!ctx) throw new Error('usePreferences debe usarse dentro de PreferencesProvider');
  return ctx;
}

/** Lee un texto en voz alta al mostrarse, si el modo de lectura lo pide. */
export function useAutoRead(text: string | null | undefined, enabled = true) {
  const { autoRead, speak } = usePreferences();
  useEffect(() => {
    if (!enabled || !autoRead || !text) return;
    const t = window.setTimeout(() => speak(text), 350);
    return () => window.clearTimeout(t);
  }, [text, enabled, autoRead, speak]);
}
