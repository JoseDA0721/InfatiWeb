/** Sonidos cortos y suaves generados con Web Audio (sin archivos). Respetan volumen y silencio. */
let ctx: AudioContext | null = null;

type Cue = 'select' | 'success' | 'encourage' | 'celebrate' | 'star';

const NOTES: Record<Cue, number[]> = {
  select: [660],
  success: [523.25, 659.25, 783.99],
  encourage: [440, 523.25],
  celebrate: [523.25, 659.25, 783.99, 1046.5],
  star: [880, 1174.66],
};

export function playCue(cue: Cue, volume: number, muted: boolean) {
  if (muted || volume <= 0 || typeof window === 'undefined') return;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  ctx ??= new AudioCtor();
  if (ctx.state === 'suspended') void ctx.resume();
  const start = ctx.currentTime;
  const step = cue === 'select' ? 0 : 0.11;
  NOTES[cue].forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = start + i * step;
    const peak = 0.12 * volume;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (cue === 'select' ? 0.12 : 0.32));
    osc.connect(gain).connect(ctx!.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}
