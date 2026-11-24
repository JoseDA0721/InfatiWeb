import { useSyncExternalStore } from 'react';

/** Locución con Web Speech API. Todo lo que se dice también está escrito en pantalla. */
export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let speakingId: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function pickVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported) return null;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'));
  const preferred = ['es-419', 'es-mx', 'es-us', 'es-co', 'es-ec', 'es-es'];
  for (const lang of preferred) {
    const match = voices.find((v) => v.lang.toLowerCase() === lang);
    if (match) return match;
  }
  return voices[0] ?? null;
}

export interface SpeakOptions {
  volume: number;
  rate: number;
  muted: boolean;
  id?: string;
}

export function speak(text: string, { volume, rate, muted, id = text }: SpeakOptions) {
  if (!speechSupported || muted || volume <= 0 || !text.trim()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? 'es-MX';
  utterance.volume = Math.min(1, Math.max(0, volume));
  utterance.rate = rate;
  utterance.pitch = 1.05;
  utterance.onend = utterance.onerror = () => {
    if (speakingId === id) {
      speakingId = null;
      emit();
    }
  };
  speakingId = id;
  emit();
  synth.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (!speechSupported) return;
  window.speechSynthesis.cancel();
  speakingId = null;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Devuelve el id del texto que se está leyendo, para mostrar «Detener». */
export function useSpeakingId() {
  return useSyncExternalStore(subscribe, () => speakingId, () => null);
}
