import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, FolderKanban, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/lib/api';
import { getProject, type ProjectDetail } from '@/lib/projects-api';

export function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/app/projects/$projectId' });
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getProject(projectId);
        if (!cancelled) {
          setProject(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load project';
          toast.error(message);
          await navigate({ to: '/app' });
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
  }, [projectId, navigate]);

  if (isLoading || !project) {
    return (
      <AppShell title="Project" subtitle="Loading…">
        <div className="h-48 animate-pulse rounded-2xl border border-border bg-card/50" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={project.name}
      subtitle={project.description || 'Project overview. Issues board comes next.'}
      actions={
        <Button variant="outline" asChild>
          <Link
            to="/app/workspaces/$workspaceId"
            params={{ workspaceId: project.workspaceId }}
          >
            Back to workspace
          </Link>
        </Button>
      }
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link
          to="/app/workspaces/$workspaceId"
          params={{ workspaceId: project.workspaceId }}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {project.workspace.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{project.key}</span>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80 bg-card/70">
          <CardHeader>
            <div className="mb-2 inline-flex rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
              {project.key}
            </div>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="size-5 text-primary" />
              Ready for issues
            </CardTitle>
            <CardDescription>
              This project is set up. The next milestone is Kanban issues (Task / Bug) with statuses and assignees.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Issues', value: String(project._count.issues) },
              { label: 'Members', value: String(project.members.length) },
              { label: 'Status', value: 'Active' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/70 bg-background/40 px-3 py-3"
              >
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" />
              Project members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
                <Badge variant="secondary">{member.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
