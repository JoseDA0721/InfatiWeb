import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button';
import { PinPad } from '../../components/PinPad';
import { api, ApiError } from '../../lib/api';
import { asset } from '../../lib/assets';
import { keys } from '../../lib/queries';
import { ForgotPinDialog } from './ForgotPinDialog';
import './auth.css';

export function FamilyLoginPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [missing, setMissing] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: () => api.post('/auth/family-login', { username, pin }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: keys.session });
      navigate('/familia', { replace: true });
    },
    onError: () => setPin(''),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = !username.trim() ? 'Escribe el usuario de familia.' : pin.length < 4 ? 'Completa los 4 números del PIN.' : null;
    setMissing(problem);
    if (!problem) login.mutate();
  }

  const error = login.error as ApiError | null;
  const message = missing ?? error?.message;
  const attemptsLeft = error?.data?.attemptsLeft as number | undefined;

  return (
    <section className="auth">
      <form className="auth__card auth__card--family" onSubmit={submit} noValidate>
        <div className="auth__heading">
          <img src={asset('picto_familia')} alt="" />
          <div>
            <h1>Hola, familia</h1>
            <p>Ingresa tu usuario y tu PIN para acompañar el aprendizaje.</p>
          </div>
        </div>

        <label className="field">
          <span className="field__label">Usuario de familia</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>

        <div className="field">
          <span className="field__label" id="pin-label">
            PIN de 4 números
          </span>
          <PinPad value={pin} onChange={setPin} />
        </div>

        {message && (
          <div className="notice notice--encourage" role="alert">
            <Lightbulb aria-hidden="true" />
            <div>
              <p>{message}</p>
              {attemptsLeft !== undefined && attemptsLeft <= 2 && (
                <p className="notice__extra">
                  Quedan {attemptsLeft} {attemptsLeft === 1 ? 'intento' : 'intentos'} antes de una pausa de 5 minutos.
                </p>
              )}
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" size="xl" block disabled={login.isPending}>
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
        <div className="auth__links">
          <Button variant="ghost" onClick={() => setForgotOpen(true)}>
            ¿Olvidaste tu PIN?
          </Button>
        </div>
      </form>
      <ForgotPinDialog open={forgotOpen} onClose={() => setForgotOpen(false)} initialUsername={username} />
    </section>
  );
}
