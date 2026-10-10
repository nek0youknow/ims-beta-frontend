import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, FolderKanban, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/lib/api';
import { listWorkspaces, type WorkspaceListItem } from '@/lib/workspaces-api';

export function WorkspacesPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <AppShell title="Workspaces" subtitle="Loading…">
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl border border-border bg-card/50" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Workspaces"
      subtitle="Your team homes. Open one to manage projects and members."
      actions={
        <Button asChild>
          <Link to="/app/onboarding">
            <Plus className="size-4" />
            New workspace
          </Link>
        </Button>
      }
    >
      {workspaces.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/50">
          <CardHeader>
            <CardTitle>No workspaces yet</CardTitle>
            <CardDescription>
              Create your first workspace to invite people and start projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => void navigate({ to: '/app/onboarding' })}>
              <Plus className="size-4" />
              Create workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => {
            const role = workspace.members[0]?.role ?? 'MEMBER';
            return (
              <Link
                key={workspace.id}
                to="/app/workspaces/$workspaceId"
                params={{ workspaceId: workspace.id }}
                className="group"
              >
                <Card className="h-full border-border/80 bg-card/70 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl">{workspace.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {workspace.description || 'No description yet'}
                        </CardDescription>
                      </div>
                      <Badge>{role}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {workspace._count.members}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FolderKanban className="size-3.5" />
                        {workspace._count.projects}
                      </span>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
