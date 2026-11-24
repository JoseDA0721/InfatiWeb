import { ButtonLink } from '../../components/Button';
import { Nubi } from '../../components/Nubi';
import { SpeakButton } from '../../components/SpeakButton';
import { asset } from '../../lib/assets';
import './welcome.css';

const SECTIONS = [
  {
    picto: 'picto_nino',
    title: 'Para niñas y niños',
    text: 'Entra con tu nombre y tu clave secreta, o con tus tres imágenes. Juega aventuras cortas para conocer tus emociones y gana estrellas. Equivocarte nunca te quita puntos.',
  },
  {
    picto: 'picto_familia',
    title: 'Para la familia',
    text: 'Entra con tu usuario y tu PIN de cuatro números. Verás cada semana qué practicó, sus logros, su tiempo de uso e ideas para hacer juntos en casa.',
  },
  {
    picto: 'picto_ayuda',
    title: 'Si necesitas ayuda',
    text: 'Pide ayuda a un adulto de tu familia. Dentro del juego, el botón Ayuda está siempre arriba y el botón Escuchar lee cada instrucción en voz alta.',
  },
];

export function HowItWorksPage() {
  const all = `¿Cómo funciona InfantiWeb? InfantiWeb es un lugar para aprender sobre las emociones jugando. ${SECTIONS.map((s) => `${s.title}. ${s.text}`).join(' ')}`;
  return (
    <section className="page how">
      <header className="how__header">
        <div>
          <h1>¿Cómo funciona InfantiWeb?</h1>
          <p className="lead">Un lugar para aprender sobre las emociones jugando, con tu familia cerca.</p>
        </div>
        <Nubi size={140} />
      </header>
      <SpeakButton text={all} label="Escuchar todo" size="lg" />
      <ol className="how__list">
        {SECTIONS.map((section, i) => (
          <li key={section.title} className="how__item">
            <img src={asset(section.picto)} alt="" />
            <div>
              <h2>
                <span className="sr-only">Paso {i + 1}: </span>
                {section.title}
              </h2>
              <p>{section.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="how__actions">
        <ButtonLink to="/entrar" variant="primary" size="lg" picto="picto_nino">
          Entrar como niño o niña
        </ButtonLink>
        <ButtonLink to="/familia/entrar" variant="secondary" size="lg" picto="picto_familia">
          Entrar como familia
        </ButtonLink>
      </div>
    </section>
  );
}
