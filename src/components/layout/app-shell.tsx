import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Bell, LogOut, Plus, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Hide the default page title row (e.g. custom Overview greeting). */
  hidePageHeader?: boolean;
};

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  hidePageHeader = false,
}: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  async function handleLogout() {
    try {
      await logout();
      toast.success('Signed out');
      await navigate({ to: '/' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to sign out';
      toast.error(message);
    }
  }

  const navItems = [
    {
      label: 'Overview',
      to: '/app' as const,
      match: (path: string) => path === '/app' || path === '/app/',
    },
    {
      label: 'Workspaces',
      to: '/app/workspaces' as const,
      match: (path: string) =>
        path.startsWith('/app/workspaces') || path.startsWith('/app/onboarding'),
    },
    {
      label: 'Projects',
      to: '/app/projects' as const,
      match: (path: string) => path === '/app/projects' || path.startsWith('/app/projects/'),
    },
  ];

  const initials =
    user?.name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'IM';

  return (
    <div className="relative min-h-svh">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] size-[28rem] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute right-[-5%] top-[20%] size-[22rem] rounded-full bg-accent/15 blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/app" className="text-[1.35rem] font-medium tracking-tight text-foreground">
            IssueManage<span className="text-primary">.io</span>
          </Link>

          <nav className="order-3 flex w-full justify-center md:order-none md:w-auto">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.04] p-1 backdrop-blur-xl">
              {navItems.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-normal transition-colors',
                      active
                        ? 'bg-white/10 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <span className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground/50 sm:inline">
                Metrics
              </span>
              <span className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground/50 lg:inline">
                Teams
              </span>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:bg-white/8 hover:text-foreground"
              type="button"
              aria-label="Search"
            >
              <Search className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:bg-white/8 hover:text-foreground"
              type="button"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full border-white/10 bg-white/[0.04] sm:inline-flex"
              asChild
            >
              <Link to="/app/onboarding">
                <Plus className="size-3.5" />
                Workspace
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="group relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-linear-to-br from-primary/40 to-accent/40 text-xs font-medium text-foreground"
              title={`Sign out (${user?.name ?? 'user'})`}
            >
              <span>{initials}</span>
              <span className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                <LogOut className="size-3.5" />
              </span>
            </button>
          </div>
        </header>

        <main className="landing-fade-up space-y-6">
          {!hidePageHeader && (title || actions) ? (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {title ? <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">{title}</h1> : null}
                {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
