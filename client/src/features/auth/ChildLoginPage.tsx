import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Lightbulb } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '../../components/Button';
import { Nubi } from '../../components/Nubi';
import { PictureKey } from '../../components/PictureKey';
import { SpeakButton } from '../../components/SpeakButton';
import { api, ApiError } from '../../lib/api';
import { asset } from '../../lib/assets';
import { keys } from '../../lib/queries';
import type { Session } from '../../lib/types';
import { usePreferences } from '../preferences/PreferencesContext';
import { ForgotKeyDialog } from './ForgotKeyDialog';
import './auth.css';

type Mode = 'texto' | 'imagenes';

export function ChildLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = useQueryClient();
  const { speak } = usePreferences();
  const [mode, setMode] = useState<Mode>('texto');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [pictures, setPictures] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [missing, setMissing] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: () =>
      api.post<{ child: NonNullable<Session['child']> }>(
        '/auth/child-login',
        mode === 'texto' ? { name, password } : { name, pictures },
      ),
    onSuccess: async ({ child }) => {
      await client.invalidateQueries({ queryKey: keys.session });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(child.tutorialDone ? (from ?? '/inicio') : '/tutorial', { replace: true });
    },
    onError: (error) => speak(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = !name.trim()
      ? 'Escribe tu nombre.'
      : mode === 'texto' && !password
        ? 'Escribe tu clave secreta.'
        : mode === 'imagenes' && pictures.length < 3
          ? 'Toca tus 3 imágenes en orden.'
          : null;
    setMissing(problem);
    if (problem) {
      speak(problem);
      return;
    }
    login.mutate();
  }

  const error = login.error as ApiError | null;
  const message = missing ?? error?.message;
  const attemptsLeft = error?.data?.attemptsLeft as number | undefined;

  return (
    <section className="auth">
      <form className="auth__card" onSubmit={submit} noValidate>
        <div className="auth__heading">
          <img src={asset('picto_nino')} alt="" />
          <div>
            <h1>¡Qué bueno verte!</h1>
            <p>Escribe tu nombre y tu clave secreta.</p>
          </div>
        </div>
        <SpeakButton text="¡Qué bueno verte! Escribe tu nombre y tu clave secreta. Si prefieres, usa tu clave con imágenes." />

        <label className="field">
          <span className="field__label">Mi nombre</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="username"
            autoCapitalize="words"
            spellCheck={false}
            aria-invalid={Boolean(message) && !name.trim()}
          />
        </label>

        <div className="segmented" role="tablist" aria-label="Cómo quiero entrar">
          <button type="button" role="tab" aria-selected={mode === 'texto'} onClick={() => setMode('texto')}>
            Escribir mi clave
          </button>
          <button type="button" role="tab" aria-selected={mode === 'imagenes'} onClick={() => setMode('imagenes')}>
            Clave con imágenes
          </button>
        </div>

        {mode === 'texto' ? (
          <label className="field">
            <span className="field__label">Mi clave secreta</span>
            <span className="field__password">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="field__reveal"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </span>
          </label>
        ) : (
          <fieldset className="field">
            <legend className="field__label">Toca tus 3 imágenes en orden</legend>
            <PictureKey value={pictures} onChange={setPictures} />
          </fieldset>
        )}

        {message && (
          <div className="notice notice--encourage" role="alert">
            <Lightbulb aria-hidden="true" />
            <div>
              <p>{message}</p>
              {attemptsLeft !== undefined && attemptsLeft <= 2 && (
                <p className="notice__extra">
                  Te quedan {attemptsLeft} {attemptsLeft === 1 ? 'intento' : 'intentos'}. Si no la recuerdas, pide ayuda a un adulto.
                </p>
              )}
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" size="xl" block disabled={login.isPending}>
          {login.isPending ? 'Entrando…' : 'Entrar a mi mundo'}
        </Button>

        <div className="auth__links">
          <Button variant="ghost" onClick={() => setForgotOpen(true)}>
            ¿Olvidaste tu clave?
          </Button>
        </div>
      </form>
      <Nubi size={170} className="auth__mascot" float />
      <ForgotKeyDialog open={forgotOpen} onClose={() => setForgotOpen(false)} initialName={name} />
    </section>
  );
}
