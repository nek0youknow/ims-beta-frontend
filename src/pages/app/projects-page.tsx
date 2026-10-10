import { Link } from '@tanstack/react-router';
import { ArrowRight, FolderKanban, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { listProjects, type ProjectListItem } from '@/lib/projects-api';
import { listWorkspaces, type WorkspaceListItem } from '@/lib/workspaces-api';

type ProjectWithWorkspace = ProjectListItem & {
  workspaceName: string;
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithWorkspace[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const workspaceList = await listWorkspaces();
        if (cancelled) {
          return;
        }

        setWorkspaces(workspaceList);

        const nested = await Promise.all(
          workspaceList.map(async (workspace) => {
            const items = await listProjects(workspace.id);
            return items.map((project) => ({
              ...project,
              workspaceName: workspace.name,
            }));
          }),
        );

        if (!cancelled) {
          setProjects(nested.flat());
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load projects';
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
      <AppShell title="Projects" subtitle="Loading…">
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-[1.75rem] bg-white/5" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Projects"
      subtitle="All projects across your workspaces."
      actions={
        workspaces[0] ? (
          <Button asChild>
            <Link to="/app/workspaces/$workspaceId" params={{ workspaceId: workspaces[0].id }}>
              <Plus className="size-4" />
              Open workspace
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/app/onboarding">
              <Plus className="size-4" />
              Create workspace
            </Link>
          </Button>
        )
      }
    >
      {projects.length === 0 ? (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-normal">No projects yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Open a workspace and create your first project with a key like WEB or APP.
          </p>
          <div className="mt-4">
            {workspaces[0] ? (
              <Button asChild>
                <Link
                  to="/app/workspaces/$workspaceId"
                  params={{ workspaceId: workspaces[0].id }}
                >
                  Open workspace
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/app/onboarding">Create workspace</Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/app/projects/$projectId"
              params={{ projectId: project.id }}
              className="group glass-panel block p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="rounded-lg bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                  {project.key}
                </span>
                <Badge variant="outline">{project.workspaceName}</Badge>
              </div>
              <h3 className="text-lg font-normal text-foreground">{project.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.description || 'No description'}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FolderKanban className="size-3.5" />
                  {project._count.issues} issues · {project._count.members} members
                </span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
