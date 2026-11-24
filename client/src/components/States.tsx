import { RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { Nubi } from './Nubi';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <Nubi size={120} float />
      <p className="state__text">{label}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  actionLabel = 'Intentar otra vez',
}: {
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="state" role="alert">
      <Nubi size={120} />
      <p className="state__text">{message}</p>
      {onRetry && (
        <Button
          variant="primary"
          icon={actionLabel === 'Intentar otra vez' ? <RotateCcw aria-hidden="true" className="btn__icon" /> : undefined}
          picto={actionLabel === 'Intentar otra vez' ? undefined : 'picto_mapa'}
          onClick={onRetry}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
