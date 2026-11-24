import { Clock3, HeartHandshake, MessageCircle, Wind } from 'lucide-react';
import { ErrorState, LoadingState } from '../../components/States';
import { useFamilyChild, useFamilyData } from './shared';

interface Recommendation {
  id: number;
  skill: string;
  skillTitle: string;
  title: string;
  body: string;
  minutes: number;
}

const SKILL_ICON = {
  reconocimiento: HeartHandshake,
  comprension: MessageCircle,
  regulacion: Wind,
  expresion: MessageCircle,
} as const;

/* F7 · Recomendaciones para casa */
export function RecommendationsPage() {
  const child = useFamilyChild();
  const { data, isPending, error, refetch } = useFamilyData<{ focusSkill: string; recommendations: Recommendation[] }>(child.id, 'recommendations');
  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  return (
    <div className="fpage">
      <h1>Ideas para hacer en casa</h1>
      <p className="lead">
        Esta semana proponemos practicar <strong>{data.focusSkill.toLowerCase()}</strong>, la habilidad que {child.name} ha explorado menos.
      </p>
      <ul className="tips">
        {data.recommendations.map((r) => {
          const Icon = SKILL_ICON[r.skill as keyof typeof SKILL_ICON] ?? HeartHandshake;
          return (
            <li key={r.id} className="tip">
              <Icon aria-hidden="true" className="tip__icon" />
              <div>
                <h2>{r.title}</h2>
                <p>{r.body}</p>
                <p className="tip__meta">
                  <Clock3 aria-hidden="true" /> <span className="num">{r.minutes} minutos</span> · {r.skillTitle}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* Guía breve para familias */
export function GuidePage() {
  const child = useFamilyChild();
  const tips = [
    {
      title: 'Acompañen, no evalúen',
      text: `Los niveles muestran lo que ${child.name} ha practicado, no un diagnóstico. Celebren el esfuerzo más que el resultado.`,
    },
    {
      title: 'Sesiones cortas',
      text: 'Cada actividad dura de 2 a 4 minutos. Una o dos al día es suficiente; la meta semanal es de 5 y no se pierde nada si un día no juega.',
    },
    {
      title: 'Equivocarse está bien',
      text: 'La plataforma nunca resta puntos. Si ven que se equivoca, pueden animarle a pedir una pista o a escuchar la pregunta.',
    },
    {
      title: 'Ajusten cómo ve y oye',
      text: 'En «Ajustes», dentro de su sesión, pueden cambiar el tamaño de letra, el contraste, el volumen, la velocidad de la voz y reducir el movimiento.',
    },
    {
      title: 'Si pide ayuda',
      text: 'Cuando toca «Necesito ayuda», verán un aviso en el Resumen. Es una buena oportunidad para conversar sin apuro.',
    },
    {
      title: 'Si olvida su clave',
      text: 'En la pantalla de entrada, «¿Olvidaste tu clave?» les permite crear una nueva con su PIN. También pueden cambiarla en «Perfil y privacidad».',
    },
  ];
  return (
    <div className="fpage">
      <h1>Guía para familias</h1>
      <p className="lead">Seis claves para acompañar a {child.name} en InfantiWeb.</p>
      <ol className="guide">
        {tips.map((t) => (
          <li key={t.title}>
            <h2>{t.title}</h2>
            <p>{t.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
