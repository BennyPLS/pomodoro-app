import { useStore } from '@tanstack/react-form'
import type { ComponentProps } from 'react'
import { ErrorMessages } from '@/components/form/error-messages'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFieldContext } from '@/hooks/form'

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
        placeholder={placeholder}
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
