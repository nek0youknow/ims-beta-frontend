import * as React from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: React.ComponentProps<'input'>['type'];
  placeholder?: string;
  autoComplete?: string;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
}: FormFieldProps<T>) {
  const id = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={fieldState.invalid}
            className={cn(fieldState.error && 'border-destructive focus-visible:ring-destructive')}
            {...field}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}
