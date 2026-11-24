import { useQuery } from '@tanstack/react-query';
import { Compass, Sparkles, Sprout, ThumbsUp } from 'lucide-react';
import { useOutletContext } from 'react-router';
import { api } from '../../lib/api';
import { keys } from '../../lib/queries';

export interface FamilyChild {
  id: number;
  name: string;
  avatarId: number;
  age: number | null;
}

export const useFamilyChild = () => useOutletContext<FamilyChild>();

export function useFamilyData<T>(childId: number, resource: string) {
  return useQuery({
    queryKey: [...keys.family, childId, resource],
    queryFn: () => api.get<T>(`/family/${childId}/${resource}`),
  });
}

/** Nivel en palabras + ícono + forma; nunca solo color. */
export const LEVEL_STYLE = {
  'Muy bueno': { icon: Sparkles, tone: 'top' },
  Bueno: { icon: ThumbsUp, tone: 'good' },
  'En progreso': { icon: Sprout, tone: 'grow' },
  'Por explorar': { icon: Compass, tone: 'explore' },
} as const;

export type SkillLevel = keyof typeof LEVEL_STYLE;

export function LevelTag({ level }: { level: SkillLevel }) {
  const { icon: Icon, tone } = LEVEL_STYLE[level];
  return (
    <span className={`level-tag level-tag--${tone}`}>
      <Icon aria-hidden="true" />
      {level}
    </span>
  );
}
