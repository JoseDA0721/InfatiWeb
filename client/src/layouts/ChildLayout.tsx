import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { SoundControl } from '../components/SoundControl';
import { LoadingState } from '../components/States';
import { api } from '../lib/api';
import { asset, avatarAsset } from '../lib/assets';
import { useSession } from '../lib/queries';
import { BackProvider, useBackHandler } from './BackContext';

const NAV = [
  { to: '/inicio', label: 'Inicio', picto: 'picto_inicio' },
  { to: '/mapa', label: 'Mapa', picto: 'picto_mapa' },
  { to: '/premios', label: 'Premios', picto: 'picto_premios' },
  { to: '/perfil', label: 'Perfil', picto: 'avatar' },
  { to: '/ajustes', label: 'Ajustes', picto: 'picto_ajustes' },
];

/** Suma tiempo de uso cada 30 s mientras la pestaña está visible. */
function useUsageHeartbeat() {
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        api.post('/usage/heartbeat', { seconds: 30 }).catch(() => {});
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);
}

export function RequireChild({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const location = useLocation();
  if (session.isPending) return <LoadingState />;
  if (!session.data?.child) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const override = useBackHandler();
  return (
    <button
      type="button"
      className="back-btn"
      onClick={() => {
        if (override) return override();
        if (location.pathname === '/inicio') return navigate('/');
        if (window.history.state?.idx > 0) return navigate(-1);
        navigate('/inicio');
      }}
    >
      <ArrowLeft aria-hidden="true" />
      <span>Volver</span>
    </button>
  );
}

function ChildShell() {
  const session = useSession();
  const child = session.data!.child!;
  const location = useLocation();
  useUsageHeartbeat();

  if (!child.tutorialDone && location.pathname !== '/ayuda') return <Navigate to="/tutorial" replace />;

  const pictoFor = (picto: string) => (picto === 'avatar' ? avatarAsset(child.avatarId) : asset(picto));

  return (
    <div className={`child-app ${location.pathname.startsWith('/actividad/') ? 'is-focus' : ''}`}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <BackButton />
          <Link to="/inicio" className="topbar__brand" aria-label="InfantiWeb, ir a Inicio">
            <Logo size="sm" />
          </Link>
          <nav className="topbar__nav" aria-label="Principal">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-btn">
                <img className={`nav-btn__picto ${item.picto === 'avatar' ? 'is-avatar' : ''}`} src={pictoFor(item.picto)} alt="" />
                <span className="nav-btn__label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="topbar__tools">
            <SoundControl />
            <NavLink to="/ayuda" className="nav-btn">
              <img className="nav-btn__picto" src={asset('picto_ayuda')} alt="" />
              <span className="nav-btn__label">Ayuda</span>
            </NavLink>
          </div>
        </div>
      </header>
      <main id="contenido" className="child-main" tabIndex={-1}>
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Principal en celular">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className="tabbar__item">
            <img className={item.picto === 'avatar' ? 'is-avatar' : ''} src={pictoFor(item.picto)} alt="" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function ChildLayout() {
  return (
    <RequireChild>
      <BackProvider>
        <ChildShell />
      </BackProvider>
    </RequireChild>
  );
}
