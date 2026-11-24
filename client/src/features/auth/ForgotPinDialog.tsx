import { useMutation } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { api } from '../../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  initialUsername: string;
}

/** Recuperación del PIN con la pregunta de seguridad de la familia. */
export function ForgotPinDialog({ open, onClose, initialUsername }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [newPin, setNewPin] = useState('');
  const [done, setDone] = useState(false);

  const ask = useMutation({
    mutationFn: () => api.post<{ question: string }>('/auth/pin-question', { username }),
    onSuccess: (data) => setQuestion(data.question),
  });
  const recover = useMutation({
    mutationFn: () => api.post('/auth/pin-recovery', { username, answer, newPin }),
    onSuccess: () => setDone(true),
  });

  function close() {
    onClose();
    window.setTimeout(() => {
      setQuestion(null);
      setAnswer('');
      setNewPin('');
      setDone(false);
      ask.reset();
      recover.reset();
    }, 200);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!question) ask.mutate();
    else recover.mutate();
  }

  const error = ask.error ?? recover.error;

  return (
    <Modal open={open} onClose={close} title={done ? 'PIN actualizado' : 'Recuperar el PIN'}>
      {done ? (
        <div className="stack">
          <p className="lead">Ya puedes entrar con tu PIN nuevo.</p>
          <Button variant="primary" size="lg" block onClick={close}>
            Entrar con mi PIN nuevo
          </Button>
        </div>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          <label className="field">
            <span className="field__label">Usuario de familia</span>
            <input
              className="input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setQuestion(null);
              }}
              autoComplete="username"
            />
          </label>
          {question && (
            <>
              <label className="field">
                <span className="field__label">{question}</span>
                <input className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} autoComplete="off" />
              </label>
              <label className="field">
                <span className="field__label">PIN nuevo (4 números)</span>
                <input
                  className="input input--pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  autoComplete="new-password"
                />
              </label>
            </>
          )}
          {error && (
            <div className="notice notice--encourage" role="alert">
              <Lightbulb aria-hidden="true" />
              <p>{error.message}</p>
            </div>
          )}
          <Button type="submit" variant="primary" size="lg" block disabled={ask.isPending || recover.isPending}>
            {question ? 'Guardar PIN nuevo' : 'Continuar'}
          </Button>
        </form>
      )}
    </Modal>
  );
}
