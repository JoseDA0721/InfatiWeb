import { Check } from 'lucide-react';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

type ToastFn = (message: string) => void;

const ToastContext = createContext<ToastFn>(() => {});

/** Avisos breves («Guardado», «Avisamos a tu familia») leídos por el lector de pantalla. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<{ text: string; key: number } | null>(null);
  const show = useCallback<ToastFn>((text) => setMessage({ text, key: Date.now() }), []);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 3800);
    return () => window.clearTimeout(t);
  }, [message]);

  return (
    <ToastContext value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {message && (
          <div className="toast" key={message.key}>
            <span className="toast__icon" aria-hidden="true">
              <Check />
            </span>
            {message.text}
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export const useToast = () => use(ToastContext);
