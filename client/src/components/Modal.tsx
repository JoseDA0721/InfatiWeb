import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Ventanas de celebración: más anchas y con fondo festivo. */
  tone?: 'default' | 'celebration';
  /** Oculta la X cuando la ventana ya tiene sus propios botones de salida. */
  hideClose?: boolean;
  labelledById?: string;
}

/**
 * Ventana centrada con fondo atenuado. Usa <dialog> nativo: atrapa el foco,
 * se cierra con Esc y devuelve el foco al control que la abrió.
 */
export function Modal({ open, onClose, title, children, tone = 'default', hideClose }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal--${tone}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="modal__body">
          {!hideClose && (
            <button type="button" className="modal__close" onClick={onClose}>
              <X aria-hidden="true" />
              <span>Cerrar</span>
            </button>
          )}
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
