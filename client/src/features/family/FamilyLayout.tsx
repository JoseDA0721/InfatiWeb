import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, useNavigate, useParams } from 'react-router';
import { Logo } from '../../components/Logo';
import { ErrorState, LoadingState } from '../../components/States';
import { api } from '../../lib/api';
import { avatarAsset } from '../../lib/assets';
import { keys, useSession } from '../../lib/queries';
import './family.css';

export interface FamilyChildren {
  family: { name: string; username: string };
  children: { id: number; name: string; avatarId: number; age: number | null }[];
}

export const useFamilyChildren = () =>
  useQuery({ queryKey: [...keys.family, 'children'], queryFn: () => api.get<FamilyChildren>('/family/children') });

const TABS = [
  { to: 'resumen', label: 'Resumen' },
  { to: 'habilidades', label: 'Habilidades' },
  { to: 'actividades', label: 'Actividades' },
  { to: 'logros', label: 'Logros' },
  { to: 'tiempo', label: 'Tiempo de uso' },
  { to: 'en-casa', label: 'Ideas para casa' },
  { to: 'perfil', label: 'Perfil y privacidad' },
  { to: 'guia', label: 'Guía para familias' },
];

export function FamilyIndex() {
  const { data, isPending, error } = useFamilyChildren();
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (data.children.length === 0) {
    return <ErrorState message="Todavía no hay niños vinculados a esta familia. Escríbenos desde soporte para agregarlos." />;
  }
  return <Navigate to={`/familia/${data.children[0].id}/resumen`} replace />;
}

export function FamilyLayout() {
  const session = useSession();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { childId } = useParams();
  const children = useFamilyChildren();

  const logout = useMutation({
    mutationFn: () => api.post('/auth/logout', { role: 'familia' }),
    onSuccess: async () => {
      client.removeQueries({ queryKey: keys.family });
      await client.invalidateQueries({ queryKey: keys.session });
      navigate('/', { replace: true });
    },
  });

  if (session.isPending) return <LoadingState />;
  if (!session.data?.family) return <Navigate to="/familia/entrar" replace />;

  const list = children.data?.children ?? [];
  const child = list.find((c) => String(c.id) === childId);

  return (
    <div className="family-app">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="family-top">
        <div className="family-top__inner">
          <Link to="/familia" className="topbar__brand" aria-label="InfantiWeb, espacio de familia">
            <Logo size="sm" />
          </Link>
          <p className="family-top__who">{children.data?.family.name ?? session.data.family.name}</p>
          <button type="button" className="btn btn--ghost btn--md" onClick={() => logout.mutate()}>
            <LogOut aria-hidden="true" className="btn__icon" />
            <span className="btn__label">Salir</span>
          </button>
        </div>
      </header>

      <div className="family-shell">
        <aside className="family-side">
          {list.length > 1 && (
            <nav className="child-switch" aria-label="Elegir niño o niña">
              {list.map((c) => (
                <NavLink key={c.id} to={`/familia/${c.id}/resumen`} className={() => `child-switch__item ${String(c.id) === childId ? 'is-active' : ''}`}>
                  <img src={avatarAsset(c.avatarId)} alt="" />
                  <span>{c.name}</span>
                </NavLink>
              ))}
            </nav>
          )}
          {child && (
            <div className="family-child">
              <img src={avatarAsset(child.avatarId)} alt="" />
              <div>
                <small>Acompañando a</small>
                <strong>{child.name}</strong>
              </div>
            </div>
          )}
          <nav className="family-tabs" aria-label="Secciones del panel de familia">
            {TABS.map((tab) => (
              <NavLink key={tab.to} to={`/familia/${childId}/${tab.to}`} className="family-tabs__item">
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main id="contenido" className="family-main" tabIndex={-1}>
          {children.isPending ? <LoadingState /> : child ? (
            <div key={child.id}>
              <Outlet context={child} />
            </div>
          ) : <ErrorState message="No encontramos a ese niño o niña en tu familia." />}
        </main>
      </div>
    </div>
  );
}
