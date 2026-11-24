import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BellRing, CalendarCheck, Clock3, Medal } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { ErrorState, LoadingState } from '../../components/States';
import { api } from '../../lib/api';
import { avatarAsset } from '../../lib/assets';
import { friendlyDate, longDate, minutesLabel, plural } from '../../lib/format';
import { keys } from '../../lib/queries';
import type { WeeklyStatus } from '../../lib/types';
import { useFamilyChild, useFamilyData } from './shared';

interface Summary {
  child: { id: number; name: string; avatarId: number; age: number | null };
  weekStart: string;
  completed: number;
  newBadges: { title: string; icon: string }[];
  usage: { totalMinutes: number; lastWeekMinutes: number };
  weekly: WeeklyStatus;
  level: { level: number; levelName: string; percent: number };
  practicedSkills: string[];
  helpRequests: { id: number; context: string; createdAt: string }[];
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

export function SummaryPage() {
  const child = useFamilyChild();
  const client = useQueryClient();
  const { data, isPending, error, refetch } = useFamilyData<Summary>(child.id, 'summary');
  const seen = useMutation({
    mutationFn: () => api.post(`/family/${child.id}/help-requests/seen`),
    onSuccess: () => client.invalidateQueries({ queryKey: [...keys.family, child.id, 'summary'] }),
  });

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const diff = data.usage.totalMinutes - data.usage.lastWeekMinutes;
  const left = Math.max(0, data.weekly.goal - data.weekly.completed);

  return (
    <div className="fpage">
      <header className="fhead">
        <img className="fhead__avatar" src={avatarAsset(data.child.avatarId)} alt="" />
        <div>
          <h1>Hola, familia</h1>
          <p className="lead">
            Esto practicó {data.child.name} en la semana que empezó el {longDate(data.weekStart)}.
          </p>
        </div>
      </header>

      {data.helpRequests.length > 0 && (
        <section className="alert-card" aria-labelledby="avisos">
          <BellRing aria-hidden="true" />
          <div>
            <h2 id="avisos">{data.child.name} pidió ayuda</h2>
            <ul>
              {data.helpRequests.map((h) => (
                <li key={h.id}>
                  {friendlyDate(h.createdAt)} · {h.context}
                </li>
              ))}
            </ul>
            <p>Pueden sentarse juntos un momento y preguntarle cómo se siente.</p>
          </div>
          <Button variant="secondary" onClick={() => seen.mutate()} disabled={seen.isPending}>
            Marcar como visto
          </Button>
        </section>
      )}

      <p className="fsummary">
        Esta semana: <strong>{plural(data.completed, 'actividad completada', 'actividades completadas')}</strong>,{' '}
        <strong>{plural(data.newBadges.length, 'insignia nueva', 'insignias nuevas')}</strong> y{' '}
        <strong>{minutesLabel(data.usage.totalMinutes)}</strong> de uso.
      </p>

      <ul className="stats">
        <li className="stat">
          <CalendarCheck aria-hidden="true" />
          <strong className="num">{data.completed}</strong>
          <span>actividades completadas</span>
        </li>
        <li className="stat">
          <Medal aria-hidden="true" />
          <strong className="num">{data.newBadges.length}</strong>
          <span>{data.newBadges.length ? `insignias nuevas: ${joinList(data.newBadges.map((b) => b.title))}` : 'insignias nuevas'}</span>
        </li>
        <li className="stat">
          <Clock3 aria-hidden="true" />
          <strong className="num">{minutesLabel(data.usage.totalMinutes)}</strong>
          <span>
            de uso esta semana
            {data.usage.lastWeekMinutes > 0 && diff !== 0 && (
              <> ({minutesLabel(Math.abs(diff))} {diff > 0 ? 'más' : 'menos'} que la semana pasada)</>
            )}
          </span>
        </li>
      </ul>

      <div className="fcolumns">
        <section className="fcard" aria-labelledby="meta-sem">
          <h2 id="meta-sem">Meta semanal</h2>
          <p className="fcard__big num">
            {Math.min(data.weekly.completed, data.weekly.goal)} de {data.weekly.goal} actividades
          </p>
          <ProgressBar
            value={(Math.min(data.weekly.completed, data.weekly.goal) / data.weekly.goal) * 100}
            label="Meta semanal"
            valueText={`${data.weekly.completed} de ${data.weekly.goal} actividades`}
            tone={data.weekly.reached ? 'success' : 'action'}
          />
          <p>
            {data.weekly.reached
              ? `¡${data.child.name} cumplió su meta de la semana!`
              : `Le ${left === 1 ? 'falta 1 actividad' : `faltan ${left} actividades`} para completar su meta. Si un día no juega, no pierde nada.`}
          </p>
        </section>
        <section className="fcard" aria-labelledby="practica">
          <h2 id="practica">Lo que practicó</h2>
          <p>
            {data.practicedSkills.length
              ? `Esta semana ha practicado actividades de ${joinList(data.practicedSkills.map((s) => s.toLowerCase()))}.`
              : 'Esta semana todavía no ha jugado. Pueden elegir juntos una aventura corta.'}
          </p>
          <p className="fcard__muted num">
            Nivel {data.level.level} · {data.level.levelName}
          </p>
          <Link to="../habilidades" relative="path" className="flink">
            Ver habilidades
          </Link>
        </section>
      </div>

      <section className="fcard fcard--reminder" aria-labelledby="recordatorio">
        <h2 id="recordatorio">Recordatorio de la semana</h2>
        <p>
          Dediquen unos minutos a conversar sobre lo que {data.child.name} aprendió. Las ideas de esta semana están pensadas
          para lo que menos ha practicado.
        </p>
        <Link to="../en-casa" relative="path" className="flink">
          Ver ideas para hacer en casa
        </Link>
      </section>
    </div>
  );
}
