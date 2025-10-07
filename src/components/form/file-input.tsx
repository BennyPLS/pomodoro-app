import { useStore } from '@tanstack/react-form'
import type { ComponentProps } from 'react'
import { useFieldContext } from '@/hooks/form'
import { Label } from '@/components/ui/label'
import { Input as ShadcnInput } from '@/components/ui/input'
import { ErrorMessages } from '@/components/form/error-messages'

export function FileInput({
  label,
  placeholder,
  ...input
}: ComponentProps<'input'> & {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<Blob | undefined>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnInput
        type="file"
        accept="audio/mpeg"
        onChange={(event) => {
          field.handleChange(event.target.files?.item(0) ?? undefined)
        }}
        {...input}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
