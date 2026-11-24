import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router';
import { ButtonLink } from './components/Button';
import { Nubi } from './components/Nubi';
import { LoadingState } from './components/States';
import { ChildLoginPage } from './features/auth/ChildLoginPage';
import { FamilyLoginPage } from './features/auth/FamilyLoginPage';
import { HelpPage } from './features/help/HelpPage';
import { HomePage } from './features/home/HomePage';
import { MapPage } from './features/map/MapPage';
import { ModulePage } from './features/map/ModulePage';
import { ProfilePage } from './features/profile/ProfilePage';
import { RewardsPage } from './features/rewards/RewardsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { TutorialPage } from './features/tutorial/TutorialPage';
import { HowItWorksPage } from './features/welcome/HowItWorksPage';
import { WelcomePage } from './features/welcome/WelcomePage';
import { ChildLayout, RequireChild } from './layouts/ChildLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { useSession } from './lib/queries';

function Root() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}

function RequireFamily({ children }: { children: React.ReactNode }) {
  const session = useSession();
  if (session.isPending) return <LoadingState />;
  if (!session.data?.family) return <Navigate to="/familia/entrar" replace />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <main className="state state--page" id="contenido">
      <Nubi size={160} />
      <h1>No encontramos esta página</h1>
      <p className="state__text">Puede que el enlace esté incompleto. Vuelve al inicio para seguir.</p>
      <ButtonLink to="/" variant="primary" size="lg" picto="picto_inicio">
        Ir al inicio
      </ButtonLink>
    </main>
  );
}

const family = () => import('./features/family');

export const router = createBrowserRouter([
  {
    element: <Root />,
    HydrateFallback: LoadingState,
    children: [
      { path: '/', element: <WelcomePage /> },
      {
        element: <PublicLayout />,
        children: [
          { path: '/como-funciona', element: <HowItWorksPage /> },
          { path: '/entrar', element: <ChildLoginPage /> },
          { path: '/familia/entrar', element: <FamilyLoginPage /> },
        ],
      },
      {
        path: '/tutorial',
        element: (
          <RequireChild>
            <TutorialPage />
          </RequireChild>
        ),
      },
      {
        element: <ChildLayout />,
        children: [
          { path: '/inicio', element: <HomePage /> },
          { path: '/mapa', element: <MapPage /> },
          { path: '/mapa/:moduleId', element: <ModulePage /> },
          {
            path: '/actividad/:activityId',
            lazy: () => import('./features/activities/ActivityPage').then((m) => ({ Component: m.ActivityRoute })),
          },
          { path: '/premios', element: <RewardsPage /> },
          { path: '/perfil', element: <ProfilePage /> },
          { path: '/ajustes', element: <SettingsPage /> },
          { path: '/ayuda', element: <HelpPage /> },
        ],
      },
      {
        path: '/familia',
        lazy: () => family().then((m) => ({ Component: () => <RequireFamily><m.FamilyIndex /></RequireFamily> })),
      },
      {
        path: '/familia/:childId',
        lazy: () => family().then((m) => ({ Component: m.FamilyLayout })),
        children: [
          { index: true, element: <Navigate to="resumen" replace /> },
          { path: 'resumen', lazy: () => family().then((m) => ({ Component: m.SummaryPage })) },
          { path: 'habilidades', lazy: () => family().then((m) => ({ Component: m.SkillsPage })) },
          { path: 'actividades', lazy: () => family().then((m) => ({ Component: m.ActivitiesPage })) },
          { path: 'logros', lazy: () => family().then((m) => ({ Component: m.AchievementsPage })) },
          { path: 'tiempo', lazy: () => family().then((m) => ({ Component: m.UsagePage })) },
          { path: 'en-casa', lazy: () => family().then((m) => ({ Component: m.RecommendationsPage })) },
          { path: 'perfil', lazy: () => family().then((m) => ({ Component: m.PrivacyPage })) },
          { path: 'guia', lazy: () => family().then((m) => ({ Component: m.GuidePage })) },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
