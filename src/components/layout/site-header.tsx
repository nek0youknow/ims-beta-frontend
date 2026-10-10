import { Link } from '@tanstack/react-router';
import { Layers3 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/auth/auth-context';
import type { AuthMode } from '@/components/auth/auth-modal';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
  className?: string;
  onOpenAuth: (mode: AuthMode) => void;
};

export function SiteHeader({ className, onOpenAuth }: SiteHeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Signed out');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to sign out';
      toast.error(message);
    }
  }

  return (
    <header className={cn('mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5', className)}>
      <Link to="/" className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-90">
        <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-primary">
          <Layers3 className="size-4" />
        </span>
        <span className="text-sm font-medium tracking-tight">
          IssueManage<span className="text-primary">.io</span>
        </span>
      </Link>

      <nav className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app">Open app</Link>
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => void handleLogout()}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => onOpenAuth('login')}>
              Sign in
            </Button>
            <Button size="sm" type="button" onClick={() => onOpenAuth('register')}>
              Get started
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
