import { Link } from '@tanstack/react-router';
import {
  ArrowUpRight,
  FolderKanban,
  Plus,
  Sparkles,
  Users,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/auth/auth-context';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { listWorkspaces, type WorkspaceListItem } from '@/lib/workspaces-api';
import { cn } from '@/lib/utils';

function ProgressMeter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'rose' | 'white' | 'muted';
}) {
  return (
    <div className="min-w-30 flex-1">
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            tone === 'rose' && 'bg-primary',
            tone === 'white' && 'bg-foreground/80',
            tone === 'muted' && 'bg-muted-foreground/50',
          )}
          style={{ width: `${Math.min(Math.max(value, 8), 100)}%` }}
        />
      </div>
    </div>
  );
}

function MetricStat({
  value,
  label,
  delta,
  up,
}: {
  value: string | number;
  label: string;
  delta: string;
  up: boolean;
}) {
  return (
    <div className="min-w-26">
      <div className="flex items-start gap-2">
        <p className="text-3xl font-normal tracking-tight text-foreground sm:text-4xl">{value}</p>
        <span
          className={cn(
            'mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px]',
            up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400',
          )}
        >
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {delta}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AppHomePage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await listWorkspaces();
        if (!cancelled) {
          setWorkspaces(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load workspaces';
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <AppShell hidePageHeader>
        <div className="space-y-6">
          <div className="h-16 animate-pulse rounded-3xl bg-white/5" />
          <div className="grid gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 animate-pulse rounded-[1.75rem] bg-white/5" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const totalProjects = workspaces.reduce((sum, workspace) => sum + workspace._count.projects, 0);
  const totalMembers = workspaces.reduce((sum, workspace) => sum + workspace._count.members, 0);
  const summary = [
    { label: 'Workspaces', value: workspaces.length, color: 'bg-accent' },
    { label: 'Projects', value: totalProjects, color: 'bg-emerald-400' },
    { label: 'Members', value: totalMembers, color: 'bg-primary' },
  ];

  // TODO: restore bubble statistics later
  // const bubbleStats = [
  //   {
  //     label: 'With projects',
  //     value: Math.round(
  //       (workspaces.filter((workspace) => workspace._count.projects > 0).length /
  //         Math.max(workspaces.length, 1)) *
  //         100,
  //     ),
  //     size: 'size-36',
  //     className: 'bg-primary text-primary-foreground left-6 top-4 z-20',
  //   },
  //   {
  //     label: 'Owned',
  //     value: Math.round(
  //       (workspaces.filter((workspace) => workspace.members[0]?.role === 'OWNER').length /
  //         Math.max(workspaces.length, 1)) *
  //         100,
  //     ),
  //     size: 'size-28',
  //     className: 'bg-accent text-accent-foreground right-4 top-10 z-10',
  //   },
  //   {
  //     label: 'Empty',
  //     value: Math.round(
  //       (workspaces.filter((workspace) => workspace._count.projects === 0).length /
  //         Math.max(workspaces.length, 1)) *
  //         100,
  //     ),
  //     size: 'size-20',
  //     className: 'bg-white/15 text-foreground bottom-4 left-1/2 z-30 -translate-x-1/2',
  //   },
  // ];

  return (
    <AppShell hidePageHeader>
      {workspaces.length === 0 ? (
        <section className="glass-panel flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="text-lg font-normal">Create your first workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview is ready. A workspace is needed to add projects and your team.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/onboarding">
              <Plus className="size-4" />
              Create workspace
            </Link>
          </Button>
        </section>
      ) : null}

      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-5">
          <h1 className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
            Welcome in, {firstName}
          </h1>
          <div className="flex flex-wrap gap-5">
            <ProgressMeter
              label="Workspaces"
              value={Math.min(workspaces.length * 25, 100)}
              tone="rose"
            />
            <ProgressMeter
              label="Projects"
              value={Math.min(totalProjects * 20, 100)}
              tone="white"
            />
            <ProgressMeter
              label="Members"
              value={Math.min(totalMembers * 15, 100)}
              tone="muted"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 sm:gap-8">
          <MetricStat value={workspaces.length} label="Active workspaces" delta="+12%" up />
          <MetricStat value={totalProjects} label="Open projects" delta="+24%" up />
          <MetricStat value={totalMembers} label="People connected" delta="-8%" up={false} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.4fr_0.9fr]">
        <div className="glass-panel flex flex-col justify-between p-5">
          <div>
            <h3 className="mb-5 text-base font-normal">Summary</h3>
            <ul className="space-y-4">
              {summary.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className={cn('size-2 rounded-full', item.color)} />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-black/30 px-3 py-1 text-sm tabular-nums text-foreground">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Create a project inside a workspace to unlock boards, issues, and assignees.
          </p>
        </div>

        <ActivityChart />

        <Link
          to="/app/onboarding"
          className="group relative overflow-hidden rounded-[1.75rem] bg-accent p-5 text-accent-foreground transition-transform hover:-translate-y-0.5"
        >
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="flex items-start justify-between">
              <p className="max-w-56 text-sm leading-relaxed text-accent-foreground/90">
                Spin up another workspace for a new team, client, or product line — roles stay
                scoped.
              </p>
              <span className="flex size-9 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:rotate-12">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-900">
                Priority
                <span className="flex size-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                  {workspaces.length}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-900">
                Next
                <span className="flex size-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                  +
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="grid gap-4 xl:grid-cols-1">
        <div className="glass-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-normal">Active workspaces</h3>
            <div className="flex gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                Newest
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                All
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {workspaces.slice(0, 3).map((workspace, index) => {
              const role = workspace.members[0]?.role ?? 'MEMBER';
              const status = workspace._count.projects > 0 ? 'Active' : 'Setup';
              return (
                <Link
                  key={workspace.id}
                  to="/app/workspaces/$workspaceId"
                  params={{ workspaceId: workspace.id }}
                  className="block rounded-[1.35rem] border border-white/8 bg-black/20 p-4 transition-colors hover:border-primary/35 hover:bg-white/4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        'rounded-md border-0',
                        index % 2 === 0
                          ? 'bg-primary/20 text-primary'
                          : 'bg-accent/20 text-accent',
                      )}
                    >
                      {status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">WS-{String(index + 1).padStart(4, '0')}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{role}</span>
                  </div>
                  <p className="text-sm text-foreground">{workspace.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {workspace.description || 'No description yet — open to add projects and members.'}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {workspace._count.members}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FolderKanban className="size-3.5" />
                      {workspace._count.projects}
                    </span>
                  </div>
                </Link>
              );
            })}

            {workspaces.length === 0 ? null : (
              <Button variant="outline" className="w-full rounded-full border-white/10 bg-transparent" asChild>
                <Link to="/app/workspaces">
                  View all workspaces
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* TODO: restore Statistics bubble chart later
        <div className="glass-panel relative overflow-hidden p-5">
          <h3 className="mb-2 text-base font-normal">Statistics</h3>
          <p className="mb-6 text-xs text-muted-foreground">Workspace mix at a glance</p>
          <div className="relative mx-auto h-52 w-full max-w-[260px]">
            {bubbleStats.map((bubble) => (
              <div
                key={bubble.label}
                className={cn(
                  'absolute flex flex-col items-center justify-center rounded-full shadow-lg shadow-black/30',
                  bubble.size,
                  bubble.className,
                )}
              >
                <span className="text-2xl font-normal">{bubble.value}%</span>
                <span className="mt-0.5 text-[10px] opacity-80">{bubble.label}</span>
              </div>
            ))}
          </div>
        </div>
        */}
      </section>
    </AppShell>
  );
}
