import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { ErrorState, LoadingState } from '../../components/States';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';
import { avatarAsset } from '../../lib/assets';
import { keys, useMe } from '../../lib/queries';
import type { Session } from '../../lib/types';
import './profile.css';

const AVATARS = [1, 2, 3];

export function ProfilePage() {
  const { data, isPending, error, refetch } = useMe();
  const client = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const avatar = useMutation({
    mutationFn: (avatarId: number) => api.patch<{ avatarId: number }>('/me/avatar', { avatarId }),
    onSuccess: ({ avatarId }) => {
      client.setQueryData<Session>(keys.session, (s) => (s?.child ? { ...s, child: { ...s.child, avatarId } } : s));
      void client.invalidateQueries({ queryKey: keys.me });
      void client.invalidateQueries({ queryKey: keys.home });
      toast('Avatar guardado');
    },
  });

  const logout = useMutation({
    mutationFn: () => api.post('/auth/logout', { role: 'nino' }),
    onSuccess: async () => {
      client.removeQueries({ queryKey: keys.home });
      client.removeQueries({ queryKey: keys.map });
      await client.invalidateQueries({ queryKey: keys.session });
      navigate('/', { replace: true });
    },
  });

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const current = (avatar.isPending ? avatar.variables : undefined) ?? data.avatarId;

  return (
    <div className="page profile">
      <h1>Mi perfil</h1>
      <section className="profile-card" aria-label="Mis datos">
        <img className="profile-card__avatar" src={avatarAsset(current)} alt={`Avatar de ${data.name}`} />
        <div>
          <p className="profile-card__name">{data.name}</p>
          <p>
            <strong className="num">Nivel {data.level}</strong> · {data.levelName}
          </p>
          <ProgressBar
            value={data.percent}
            label="Avance hacia el siguiente nivel"
            valueText={data.isMax ? 'Nivel máximo' : `${data.xpIntoLevel} de ${data.xpForNextLevel} XP`}
          />
          <p className="profile-card__xp num">
            {data.isMax ? '¡Nivel máximo!' : `${data.xpIntoLevel} de ${data.xpForNextLevel} XP para el siguiente nivel`}
          </p>
        </div>
      </section>

      <section aria-labelledby="elige-avatar">
        <h2 id="elige-avatar">Elige tu avatar</h2>
        <div className="avatar-picker" role="radiogroup" aria-label="Avatares">
          {AVATARS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={current === id}
              className={`avatar-option ${current === id ? 'is-selected' : ''}`}
              onClick={() => avatar.mutate(id)}
            >
              <img src={avatarAsset(id)} alt={`Avatar ${id}`} />
              {current === id && (
                <span className="avatar-option__mark">
                  <Check aria-hidden="true" /> Elegido
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <p className="profile__note">Tu nombre y tu clave los cambia un adulto de tu familia desde su espacio.</p>

      <Button variant="secondary" size="lg" icon={<LogOut aria-hidden="true" className="btn__icon" />} onClick={() => logout.mutate()}>
        Cerrar sesión
      </Button>
    </div>
  );
}
