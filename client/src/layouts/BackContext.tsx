import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Permite que una pantalla cambie qué hace «Volver» (por ejemplo, dentro de una
 * actividad abre el diálogo «¿Quieres salir? Tu avance se guarda»).
 */
type Handler = (() => void) | null;

const BackContext = createContext<{ handler: Handler; setHandler: (h: Handler) => void }>({
  handler: null,
  setHandler: () => {},
});

export function BackProvider({ children }: { children: ReactNode }) {
  const [handler, setHandler] = useState<Handler>(null);
  return <BackContext value={{ handler, setHandler }}>{children}</BackContext>;
}

export const useBackHandler = () => use(BackContext).handler;

export function useOverrideBack(handler: () => void) {
  const { setHandler } = use(BackContext);
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    setHandler(() => () => ref.current());
    return () => setHandler(null);
  }, [setHandler]);
}
