import { useNavigate } from 'react-router';
import { Button, ButtonLink } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { Nubi } from '../../components/Nubi';
import { SoundControl } from '../../components/SoundControl';
import { SpeakButton } from '../../components/SpeakButton';
import { asset } from '../../lib/assets';
import { useSession } from '../../lib/queries';
import './welcome.css';

const GREETING =
  'Hola, soy Nubi. Aprender lo que sientes puede ser una gran aventura. Si eres niño o niña, toca el botón morado. Si eres de la familia, toca Soy familia.';

export function WelcomePage() {
  const navigate = useNavigate();
  const session = useSession();
  const child = session.data?.child;

  return (
    <main className="welcome" id="contenido">
      <div className="welcome__tools">
        <SoundControl />
      </div>
      <div className="welcome__copy">
        <Logo size="lg" />
        <h1 className="welcome__title">Aprender lo que sientes puede ser una gran aventura</h1>
        <p className="welcome__lead">
          Juega, reconoce tus emociones y descubre nuevas formas de expresarte junto a Nubi.
        </p>
        <div className="welcome__actions">
          <Button variant="primary" size="xl" picto="picto_nino" onClick={() => navigate(child ? '/inicio' : '/entrar')}>
            {child ? `Seguir como ${child.name}` : 'Soy niño o niña'}
          </Button>
          <ButtonLink to={session.data?.family ? '/familia' : '/familia/entrar'} variant="secondary" size="xl" picto="picto_familia">
            Soy familia
          </ButtonLink>
        </div>
        <div className="welcome__secondary">
          <ButtonLink to="/como-funciona" variant="ghost" size="lg">
            ¿Cómo funciona?
          </ButtonLink>
          <SpeakButton text={GREETING} />
        </div>
      </div>

      <div className="welcome__art" aria-hidden="true">
        <div className="welcome__disc" />
        <Nubi size="min(30rem, 78vw)" float className="welcome__nubi" />
        <p className="welcome__bubble">¡Hola! Soy Nubi. Aprendamos juntos.</p>
      </div>

      <ButtonLink to="/como-funciona" variant="secondary" size="md" className="welcome__help">
        <img className="btn__picto" src={asset('picto_ayuda')} alt="" />
        Ayuda
      </ButtonLink>
    </main>
  );
}
