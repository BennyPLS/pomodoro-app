import type { AppFieldExtendedReactFormApi } from '@tanstack/react-form'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Form({
  children,
  className,
  form,
  ...props
}: ComponentProps<'form'> & {
  form: AppFieldExtendedReactFormApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any>
}) {
  return (
    <form.AppForm>
      <form
        {...props}
        noValidate
        onSubmit={(e) => {
          e.stopPropagation()
          e.preventDefault()
          void form.handleSubmit()
        }}
        className={cn('flex flex-col gap-4', className)}
      >
        {children}
      </form>
    </form.AppForm>
  )
}
