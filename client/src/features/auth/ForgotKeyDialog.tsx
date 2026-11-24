import { useMutation } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Nubi } from '../../components/Nubi';
import { PictureKey } from '../../components/PictureKey';
import { SpeakButton } from '../../components/SpeakButton';
import { api } from '../../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  initialName: string;
}

/** Recuperación asistida: el niño llama a un adulto, que usa su PIN para crear una clave nueva. */
export function ForgotKeyDialog({ open, onClose, initialName }: Props) {
  const [step, setStep] = useState<'nino' | 'adulto' | 'listo'>('nino');
  const [childName, setChildName] = useState(initialName);
  const [familyUsername, setFamilyUsername] = useState('');
  const [pin, setPin] = useState('');
  const [kind, setKind] = useState<'texto' | 'imagenes'>('texto');
  const [newPassword, setNewPassword] = useState('');
  const [newPictures, setNewPictures] = useState<string[]>([]);

  const reset = useMutation({
    mutationFn: () =>
      api.post<{ childName: string }>('/auth/reset-request', {
        childName,
        familyUsername,
        pin,
        ...(kind === 'texto' ? { newPassword } : { newPictures }),
      }),
    onSuccess: () => setStep('listo'),
  });

  function close() {
    onClose();
    window.setTimeout(() => {
      setStep('nino');
      setPin('');
      setNewPassword('');
      setNewPictures([]);
      reset.reset();
    }, 200);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    reset.mutate();
  }

  const childText = 'No pasa nada. Llama a un adulto de tu familia. Con su PIN te ayudará a crear una clave nueva.';

  return (
    <Modal open={open} onClose={close} title={step === 'listo' ? '¡Listo!' : step === 'nino' ? 'Pide ayuda a un adulto' : 'Crear una clave nueva'}>
      {step === 'nino' && (
        <div className="stack">
          <Nubi size={120} className="center" />
          <p className="lead">{childText}</p>
          <SpeakButton text={childText} />
          <Button variant="primary" size="lg" block picto="picto_familia" onClick={() => setStep('adulto')}>
            Ya está aquí un adulto
          </Button>
        </div>
      )}

      {step === 'adulto' && (
        <form className="stack" onSubmit={submit} noValidate>
          <p>Esta parte la completa una persona adulta de la familia.</p>
          <label className="field">
            <span className="field__label">Nombre del niño o niña</span>
            <input className="input" value={childName} onChange={(e) => setChildName(e.target.value)} autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Usuario de familia</span>
            <input className="input" value={familyUsername} onChange={(e) => setFamilyUsername(e.target.value)} autoComplete="username" />
          </label>
          <label className="field">
            <span className="field__label">PIN de familia (4 números)</span>
            <input
              className="input input--pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="current-password"
            />
          </label>
          <div className="segmented" role="tablist" aria-label="Tipo de clave nueva">
            <button type="button" role="tab" aria-selected={kind === 'texto'} onClick={() => setKind('texto')}>
              Clave escrita
            </button>
            <button type="button" role="tab" aria-selected={kind === 'imagenes'} onClick={() => setKind('imagenes')}>
              Clave con imágenes
            </button>
          </div>
          {kind === 'texto' ? (
            <label className="field">
              <span className="field__label">Clave nueva (mínimo 4 caracteres)</span>
              <input className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            </label>
          ) : (
            <fieldset className="field">
              <legend className="field__label">Elijan 3 imágenes en orden</legend>
              <PictureKey value={newPictures} onChange={setNewPictures} />
            </fieldset>
          )}
          {reset.error && (
            <div className="notice notice--encourage" role="alert">
              <Lightbulb aria-hidden="true" />
              <p>{reset.error.message}</p>
            </div>
          )}
          <Button type="submit" variant="primary" size="lg" block disabled={reset.isPending}>
            {reset.isPending ? 'Guardando…' : 'Guardar clave nueva'}
          </Button>
          <Button variant="ghost" block onClick={() => setStep('nino')}>
            Volver
          </Button>
        </form>
      )}

      {step === 'listo' && (
        <div className="stack">
          <Nubi size={120} stage={2} className="center" />
          <p className="lead">
            {reset.data?.childName} ya puede entrar con su clave nueva. ¡Que la recuerde bien!
          </p>
          <Button variant="primary" size="lg" block onClick={close}>
            Volver a entrar
          </Button>
        </div>
      )}
    </Modal>
  );
}
