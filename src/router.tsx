import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import { useAuth } from '@/auth/auth-context';
import { AppHomePage } from '@/pages/app/app-home-page';
import { OnboardingPage } from '@/pages/app/onboarding-page';
import { ProjectDetailPage } from '@/pages/app/project-detail-page';
import { ProjectsPage } from '@/pages/app/projects-page';
import { WorkspaceDetailPage } from '@/pages/app/workspace-detail-page';
import { WorkspacesPage } from '@/pages/app/workspaces-page';
import { LandingPage } from '@/pages/landing-page';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): { auth?: 'login' | 'register' } => {
    if (search.auth === 'login' || search.auth === 'register') {
      return { auth: search.auth };
    }

    return { auth: undefined };
  },
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    throw redirect({
      to: '/',
      search: (): { auth: 'login' | 'register' } => ({ auth: 'login' }),
    });
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: () => {
    throw redirect({
      to: '/',
      search: (): { auth: 'login' | 'register' } => ({ auth: 'register' }),
    });
  },
});

function ProtectedApp() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" search={{ auth: 'login' as const }} />;
  }

  return <Outlet />;
}

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: ProtectedApp,
});

const appIndexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: AppHomePage,
});

const appOnboardingRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/onboarding',
  component: OnboardingPage,
});

const appWorkspacesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/workspaces',
  component: WorkspacesPage,
});

const appWorkspaceDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/workspaces/$workspaceId',
  component: WorkspaceDetailPage,
});

const appProjectsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/projects',
  component: ProjectsPage,
});

const appProjectDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
});

const dashboardRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: () => {
    throw redirect({ to: '/app' });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRedirectRoute,
  appLayoutRoute.addChildren([
    appIndexRoute,
    appOnboardingRoute,
    appWorkspacesRoute,
    appWorkspaceDetailRoute,
    appProjectsRoute,
    appProjectDetailRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
