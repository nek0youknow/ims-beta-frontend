import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  key: z
    .string()
    .trim()
    .min(2, 'Key must be at least 2 characters')
    .max(10, 'Key must be at most 10 characters')
    .regex(/^[A-Za-z][A-Za-z0-9]*$/, 'Use letters/numbers, start with a letter')
    .transform((value) => value.toUpperCase()),
  description: z.string().optional(),
});

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;
export type CreateProjectFormValues = z.input<typeof createProjectSchema>;
