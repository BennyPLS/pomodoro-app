import { useStore } from '@tanstack/react-form'
import type { ComponentProps } from 'react'
import { ErrorMessages } from '@/components/form/error-messages'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFieldContext } from '@/hooks/form'

export function Input({
  label,
  placeholder,
  ...input
}: ComponentProps<'input'> & {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnInput
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...input}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
