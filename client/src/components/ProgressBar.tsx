interface ProgressBarProps {
  value: number;
  label: string;
  /** Texto que se lee junto a la barra; la información nunca depende solo del color. */
  valueText?: string;
  tone?: 'action' | 'success';
}

export function ProgressBar({ value, label, valueText, tone = 'action' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`progress progress--${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText ?? `${pct} %`}
    >
      <span className="progress__fill" style={{ inlineSize: `${pct}%` }} />
    </div>
  );
}
