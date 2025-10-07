import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { SubmitButton } from '@/components/form/submit-button'
import { FileInput } from '@/components/form/file-input'
import { Input } from '@/components/form/input'

export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts()
export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    FileInput,
    Input,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})
