import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Users,
} from 'lucide-react';

import { AuthModal, type AuthMode } from '@/components/auth/auth-modal';
import { SiteHeader } from '@/components/layout/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const routeApi = getRouteApi('/');

const featureCards = [
  {
    title: 'Workspaces',
    value: 'Teams',
    description: 'Organize people and projects in one place',
    icon: Users,
  },
  {
    title: 'Kanban',
    value: 'Board',
    description: 'Move tasks through TODO → Done',
    icon: LayoutDashboard,
  },
  {
    title: 'Tracking',
    value: 'Time',
    description: 'Log minutes and keep estimates honest',
    icon: Clock3,
  },
  {
    title: 'History',
    value: 'Audit',
    description: 'See who changed status or assignee',
    icon: Activity,
  },
];

export function LandingPage() {
  const navigate = useNavigate({ from: '/' });
  const { auth } = routeApi.useSearch();
  const authMode: AuthMode = auth === 'register' ? 'register' : 'login';
  const isAuthOpen = auth === 'login' || auth === 'register';

  function openAuth(mode: AuthMode) {
    void navigate({
      search: { auth: mode },
    });
  }

  function closeAuth() {
    void navigate({
      search: {},
    });
  }

  function setAuthMode(mode: AuthMode) {
    void navigate({
      search: { auth: mode },
    });
  }

  return (
    <div className="min-h-svh">
      <SiteHeader onOpenAuth={openAuth} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-20 pt-8">
        <section className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center space-y-6">
            <Badge variant="default" className="rounded-full px-3 py-1">
              Lightweight project management
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Ship work with a calm dark board for small teams
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Create workspaces, track tasks and bugs, assign owners, and keep activity history without the weight of a
              full Jira stack.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" type="button" onClick={() => openAuth('register')}>
                Create account
                <ArrowUpRight />
              </Button>
              <Button size="lg" variant="outline" type="button" onClick={() => openAuth('login')}>
                Sign in
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-border/80 bg-card/70 transition-colors hover:border-primary/40"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-primary/15 to-transparent opacity-80" />
              <CardHeader className="relative">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border bg-background/70 text-primary">
                  <feature.icon className="size-4" />
                </div>
                <CardDescription>{feature.title}</CardDescription>
                <CardTitle className="text-2xl">{feature.value}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle>Built for focused delivery</CardTitle>
              <CardDescription>
                Start with auth, workspaces, projects, and a Kanban board — then grow into comments, activity, and time
                logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {['Tasks & bugs', 'Assignees & priorities', 'Comments & history'].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-3 text-sm text-foreground"
                >
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-transparent bg-linear-to-br from-primary via-rose-500 to-rose-400 text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Ready to organize?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Create an account and set up your first workspace in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
                onClick={() => openAuth('register')}
              >
                Get started free
                <ArrowUpRight />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <AuthModal
        open={isAuthOpen}
        mode={authMode}
        onOpenChange={(open) => {
          if (!open) {
            closeAuth();
          }
        }}
        onModeChange={setAuthMode}
      />
    </div>
  );
}
