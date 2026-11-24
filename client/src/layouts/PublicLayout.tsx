import { ArrowLeft } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { SoundControl } from '../components/SoundControl';
import { asset } from '../lib/assets';

/** Encabezado simple para las pantallas de acceso: Volver, logo, sonido y ayuda. */
export function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="public-app">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="topbar topbar--public">
        <div className="topbar__inner">
          <button
            type="button"
            className="back-btn"
            onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))}
          >
            <ArrowLeft aria-hidden="true" />
            <span>Volver</span>
          </button>
          <Link to="/" className="topbar__brand" aria-label="InfantiWeb, ir a la bienvenida">
            <Logo size="sm" />
          </Link>
          <div className="topbar__tools">
            <SoundControl />
            {location.pathname !== '/como-funciona' && (
              <Link to="/como-funciona" className="nav-btn">
                <img className="nav-btn__picto" src={asset('picto_ayuda')} alt="" />
                <span className="nav-btn__label">Ayuda</span>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main id="contenido" className="public-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
