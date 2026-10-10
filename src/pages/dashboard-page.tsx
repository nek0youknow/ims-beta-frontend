import { Link, useNavigate } from '@tanstack/react-router';
import {
  Activity,
  Bug,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Search,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/auth/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/lib/api';

const mockIssues = [
  { key: 'WEB-12', title: 'Fix auth redirect loop', type: 'BUG', status: 'In Progress', priority: 'HIGH' },
  { key: 'WEB-18', title: 'Design project overview', type: 'TASK', status: 'Todo', priority: 'MEDIUM' },
  { key: 'APP-03', title: 'Add time log modal', type: 'TASK', status: 'Done', priority: 'LOW' },
  { key: 'APP-09', title: 'Invite workspace members', type: 'TASK', status: 'In Progress', priority: 'HIGH' },
];

const mockActivity = [
  { user: 'Alex', text: 'moved WEB-12 to In Progress', time: '2m ago' },
  { user: 'Sam', text: 'commented on APP-03', time: '18m ago' },
  { user: 'You', text: 'created WEB-18', time: '1h ago' },
];

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-svh">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-6 space-y-6 rounded-2xl border border-border/80 bg-card/70 p-4">
            <Link to="/" className="flex items-center gap-2.5 text-foreground">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-primary">
                <LayoutDashboard className="size-4" />
              </span>
              <span className="text-sm font-semibold">IssueManage</span>
            </Link>

            <nav className="space-y-1 text-sm">
              {[
                { label: 'Overview', icon: LayoutDashboard, active: true },
                { label: 'Projects', icon: FolderKanban },
                { label: 'Team', icon: Users },
                { label: 'Activity', icon: Activity },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                    item.active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name ?? 'there'}. This is a mock overview.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground sm:flex">
                <Search className="size-3.5" />
                Search issues
              </div>
              <Button variant="outline" size="sm" type="button" onClick={handleLogout}>
                <LogOut className="size-4" />
                Log out
              </Button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Open issues', value: '24', icon: FolderKanban },
              { label: 'Active bugs', value: '7', icon: Bug },
              { label: 'Team members', value: '12', icon: Users },
              { label: 'Updates today', value: '19', icon: Activity },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/80 bg-card/70">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <stat.icon className="size-4" />
                  </div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl">{stat.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle>Assigned to you</CardTitle>
                <CardDescription>Mock issue list for UI preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockIssues.map((issue) => (
                  <div
                    key={issue.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {issue.key} · {issue.type} · {issue.priority}
                      </p>
                    </div>
                    <Badge variant={issue.status === 'Done' ? 'success' : 'default'}>
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Mock timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockActivity.map((item) => (
                  <div key={`${item.user}-${item.time}`} className="rounded-xl border border-border/70 bg-background/40 px-3 py-3">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{item.user}</span>{' '}
                      <span className="text-muted-foreground">{item.text}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
