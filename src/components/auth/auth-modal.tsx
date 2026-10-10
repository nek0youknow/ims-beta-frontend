import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/ui/button';
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
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '@/lib/auth-schemas';

export type AuthMode = 'login' | 'register';

type AuthModalProps = {
  open: boolean;
  mode: AuthMode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthModal({ open, mode, onOpenChange, onModeChange }: AuthModalProps) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!open) {
      loginForm.reset();
      registerForm.reset();
    }
  }, [open, loginForm, registerForm]);

  async function onLoginSubmit(values: LoginFormValues) {
    try {
      await login(values);
      toast.success('Signed in successfully');
      onOpenChange(false);
      await navigate({ to: '/app' });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
    }
  }

  async function onRegisterSubmit(values: RegisterFormValues) {
    try {
      await register(values);
      toast.success('Account created successfully');
      onOpenChange(false);
      await navigate({ to: '/app' });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
    }
  }

  const isSubmitting = isLogin
    ? loginForm.formState.isSubmitting
    : registerForm.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/80 bg-card/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Welcome back' : 'Create your account'}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? 'Sign in to continue to your workspaces.'
              : 'Start with a free account for your team.'}
          </DialogDescription>
        </DialogHeader>

        {isLogin ? (
          <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <FormField
              control={loginForm.control}
              name="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
            />
            <FormField
              control={loginForm.control}
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : 'Sign in'}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <FormField
              control={registerForm.control}
              name="name"
              label="Name"
              placeholder="Alex Developer"
              autoComplete="name"
            />
            <FormField
              control={registerForm.control}
              name="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
            />
            <FormField
              control={registerForm.control}
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : 'Create account'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              No account yet?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => onModeChange('register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => onModeChange('login')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
