import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { HomeData, MapData, Profile, RewardsData, Session } from './types';

export const keys = {
  session: ['session'] as const,
  me: ['me'] as const,
  home: ['home'] as const,
  map: ['map'] as const,
  rewards: ['rewards'] as const,
  activity: (id: number) => ['activity', id] as const,
  preferences: ['preferences'] as const,
  family: ['family'] as const,
};

export function useSession() {
  return useQuery({ queryKey: keys.session, queryFn: () => api.get<Session>('/auth/session'), staleTime: 60_000 });
}

export const useHome = () => useQuery({ queryKey: keys.home, queryFn: () => api.get<HomeData>('/home') });
export const useMap = () => useQuery({ queryKey: keys.map, queryFn: () => api.get<MapData>('/map') });
export const useMe = () => useQuery({ queryKey: keys.me, queryFn: () => api.get<Profile>('/me') });
export const useRewards = () => useQuery({ queryKey: keys.rewards, queryFn: () => api.get<RewardsData>('/rewards') });

/** Tras jugar, todo lo que depende del progreso se vuelve a pedir. */
export function useInvalidateProgress() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: keys.home }),
      client.invalidateQueries({ queryKey: keys.map }),
      client.invalidateQueries({ queryKey: keys.me }),
      client.invalidateQueries({ queryKey: keys.rewards }),
    ]);
}
