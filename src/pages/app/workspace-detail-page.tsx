import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, FolderKanban, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { ApiError } from '@/lib/api';
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from '@/lib/app-schemas';
import { createProject, listProjects, type ProjectListItem } from '@/lib/projects-api';
import { getWorkspace, type WorkspaceDetail } from '@/lib/workspaces-api';

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams({ from: '/app/workspaces/$workspaceId' });
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [workspaceData, projectsData] = await Promise.all([
          getWorkspace(workspaceId),
          listProjects(workspaceId),
        ]);
        if (!cancelled) {
          setWorkspace(workspaceData);
          setProjects(projectsData);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load workspace';
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
  }, [workspaceId, navigate]);

  async function onCreateProject(values: CreateProjectFormValues) {
    try {
      const project = await createProject(workspaceId, {
        name: values.name,
        key: values.key.toUpperCase(),
        description: values.description || undefined,
      });
      toast.success('Project created');
      setIsCreateOpen(false);
      form.reset();
      await navigate({
        to: '/app/projects/$projectId',
        params: { projectId: project.id },
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create project';
      toast.error(message);
    }
  }

  if (isLoading || !workspace) {
    return (
      <AppShell title="Workspace" subtitle="Loading…">
        <div className="h-48 animate-pulse rounded-2xl border border-border bg-card/50" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={workspace.name}
      subtitle={workspace.description || 'Manage projects and teammates in this workspace.'}
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          New project
        </Button>
      }
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">{workspace.name}</span>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Projects</CardDescription>
            <CardTitle className="text-3xl">{projects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Members</CardDescription>
            <CardTitle className="text-3xl">{workspace.members.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Your next move</CardDescription>
            <CardTitle className="text-base">Create a project or open an existing one</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Badge variant="outline">{projects.length}</Badge>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-card/40">
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>
                Create your first project to start tracking tasks and bugs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                <Plus className="size-4" />
                Create project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                to="/app/projects/$projectId"
                params={{ projectId: project.id }}
                className="group"
              >
                <Card className="h-full border-border/80 bg-card/70 transition-colors group-hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 inline-flex rounded-lg bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                          {project.key}
                        </div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {project.description || 'No description'}
                        </CardDescription>
                      </div>
                      <FolderKanban className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {project._count.members}
                    </span>
                    <span>{project._count.issues} issues</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Members</h2>
        <Card className="border-border/80 bg-card/70">
          <CardContent className="space-y-2 p-4">
            {workspace.members.map((member) => (
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

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Use a short uppercase key like WEB or APP for issue prefixes later.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onCreateProject)}>
            <FormField
              control={form.control}
              name="name"
              label="Project name"
              placeholder="Website Redesign"
            />
            <FormField
              control={form.control}
              name="key"
              label="Project key"
              placeholder="WEB"
            />
            <FormField
              control={form.control}
              name="description"
              label="Description (optional)"
              placeholder="What this project covers"
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating…' : 'Create project'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
