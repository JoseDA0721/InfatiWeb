import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { PictureKey } from '../../components/PictureKey';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';
import { keys } from '../../lib/queries';
import { useFamilyChild } from './shared';

function ErrorNote({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <p className="notice notice--encourage" role="alert">
      <Lightbulb aria-hidden="true" /> {error.message}
    </p>
  );
}

/* F8 · Perfil y privacidad: ver, corregir y eliminar datos; cambiar PIN; soporte. */
export function PrivacyPage() {
  const child = useFamilyChild();
  const client = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age ? String(child.age) : '');
  const [keyKind, setKeyKind] = useState<'texto' | 'imagenes'>('texto');
  const [newPassword, setNewPassword] = useState('');
  const [newPictures, setNewPictures] = useState<string[]>([]);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [message, setMessage] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const refreshChildren = () => client.invalidateQueries({ queryKey: keys.family });

  const saveData = useMutation({
    mutationFn: () => api.patch(`/family/${child.id}`, { displayName: name, age: age ? Number(age) : null }),
    onSuccess: () => {
      toast('Datos guardados');
      void refreshChildren();
    },
  });
  const saveKey = useMutation({
    mutationFn: () => api.patch(`/family/${child.id}/password`, keyKind === 'texto' ? { newPassword } : { newPictures }),
    onSuccess: () => {
      toast(`Clave de ${child.name} actualizada`);
      setNewPassword('');
      setNewPictures([]);
    },
  });
  const savePin = useMutation({
    mutationFn: () => api.patch('/family/pin', { currentPin, newPin }),
    onSuccess: () => {
      toast('PIN actualizado');
      setCurrentPin('');
      setNewPin('');
    },
  });
  const support = useMutation({
    mutationFn: () => api.post('/family/support', { message }),
    onSuccess: () => {
      toast('Recibimos tu mensaje. El equipo de InfantiWeb lo revisará.');
      setMessage('');
    },
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/family/${child.id}`),
    onSuccess: async () => {
      setDeleteOpen(false);
      await refreshChildren();
      toast('Los datos fueron eliminados');
      navigate('/familia', { replace: true });
    },
  });

  const onSubmit = (fn: () => void) => (event: FormEvent) => {
    event.preventDefault();
    fn();
  };

  return (
    <div className="fpage">
      <h1>Perfil y privacidad</h1>
      <p className="lead">Solo guardamos lo necesario: nombre visible, edad, avatar y progreso de juego.</p>

      <form className="fcard fform" onSubmit={onSubmit(() => saveData.mutate())}>
        <h2>Datos de {child.name}</h2>
        <label className="field">
          <span className="field__label">Nombre visible (puede ser un seudónimo)</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />
        </label>
        <label className="field">
          <span className="field__label">Edad</span>
          <select className="input" value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="">Prefiero no decirlo</option>
            {[6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} años
              </option>
            ))}
          </select>
        </label>
        <ErrorNote error={saveData.error} />
        <Button type="submit" variant="primary" disabled={saveData.isPending}>
          Guardar cambios
        </Button>
      </form>

      <form className="fcard fform" onSubmit={onSubmit(() => saveKey.mutate())}>
        <h2>Clave de {child.name}</h2>
        <p>Crea una clave nueva si la olvidó. La anterior deja de funcionar.</p>
        <div className="segmented" role="tablist" aria-label="Tipo de clave">
          <button type="button" role="tab" aria-selected={keyKind === 'texto'} onClick={() => setKeyKind('texto')}>
            Clave escrita
          </button>
          <button type="button" role="tab" aria-selected={keyKind === 'imagenes'} onClick={() => setKeyKind('imagenes')}>
            Clave con imágenes
          </button>
        </div>
        {keyKind === 'texto' ? (
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
        <ErrorNote error={saveKey.error} />
        <Button type="submit" variant="primary" disabled={saveKey.isPending}>
          Guardar clave
        </Button>
      </form>

      <form className="fcard fform" onSubmit={onSubmit(() => savePin.mutate())}>
        <h2>PIN de la familia</h2>
        <div className="fform__row">
          <label className="field">
            <span className="field__label">PIN actual</span>
            <input
              className="input input--pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="current-password"
            />
          </label>
          <label className="field">
            <span className="field__label">PIN nuevo</span>
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
        </div>
        <ErrorNote error={savePin.error} />
        <Button type="submit" variant="primary" disabled={savePin.isPending}>
          Cambiar PIN
        </Button>
      </form>

      <form className="fcard fform" onSubmit={onSubmit(() => support.mutate())}>
        <h2>Contactar a soporte</h2>
        <p>Escríbenos si algo no funciona o tienes una duda. El equipo de InfantiWeb revisa estos mensajes.</p>
        <label className="field">
          <span className="field__label">Tu mensaje</span>
          <textarea className="input input--area" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1000} />
        </label>
        <ErrorNote error={support.error} />
        <Button type="submit" variant="primary" disabled={support.isPending}>
          Enviar mensaje
        </Button>
      </form>

      <section className="fcard fcard--danger" aria-labelledby="eliminar">
        <h2 id="eliminar">Eliminar los datos de {child.name}</h2>
        <p>Se borran su cuenta, su progreso, sus premios y su tiempo de uso. No se puede deshacer.</p>
        <Button variant="danger" icon={<Trash2 aria-hidden="true" className="btn__icon" />} onClick={() => setDeleteOpen(true)}>
          Eliminar datos
        </Button>
      </section>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={`¿Eliminar los datos de ${child.name}?`}>
        <form
          className="stack"
          onSubmit={onSubmit(() => {
            if (confirmName.trim().toLowerCase() === child.name.toLowerCase()) remove.mutate();
          })}
        >
          <p>Esta acción borra todo su progreso y no se puede deshacer.</p>
          <label className="field">
            <span className="field__label">Escribe «{child.name}» para confirmar</span>
            <input className="input" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoComplete="off" />
          </label>
          <ErrorNote error={remove.error} />
          <Button type="submit" variant="danger" block disabled={confirmName.trim().toLowerCase() !== child.name.toLowerCase() || remove.isPending}>
            Sí, eliminar para siempre
          </Button>
          <Button variant="secondary" block onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
