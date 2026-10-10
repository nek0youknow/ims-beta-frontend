import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/auth/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { ApiError } from '@/lib/api';
import {
  createWorkspaceSchema,
  type CreateWorkspaceFormValues,
} from '@/lib/app-schemas';
import { createWorkspace } from '@/lib/workspaces-api';

export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(values: CreateWorkspaceFormValues) {
    try {
      const workspace = await createWorkspace({
        name: values.name,
        description: values.description || undefined,
      });
      toast.success('Workspace created');
      await navigate({
        to: '/app/workspaces/$workspaceId',
        params: { workspaceId: workspace.id },
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create workspace';
      toast.error(message);
    }
  }

  return (
    <AppShell
      title={`Welcome, ${user?.name?.split(' ')[0] ?? 'there'}`}
      subtitle="Create your first workspace to start organizing projects."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-border/80 bg-card/80">
          <div className="h-1.5 bg-linear-to-r from-primary via-rose-400 to-primary/40" />
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <CardTitle>Set up your team space</CardTitle>
            <CardDescription>
              A workspace is your team home. You can invite people and create projects inside it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                label="Workspace name"
                placeholder="Acme Product Team"
                autoComplete="organization"
              />
              <FormField
                control={form.control}
                name="description"
                label="Description (optional)"
                placeholder="What this team works on"
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating…' : 'Create workspace'}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Create a workspace',
              text: 'Your team container for people and projects.',
            },
            {
              step: '02',
              title: 'Add a project',
              text: 'Give it a short key like WEB or APP.',
            },
            {
              step: '03',
              title: 'Invite teammates',
              text: 'Assign Owner, Admin, or Member roles.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border/70 bg-background/40 px-4 py-4"
            >
              <p className="text-xs tracking-[0.2em] text-primary">{item.step}</p>
              <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
