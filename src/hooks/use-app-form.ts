import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import SubmitButton from '~/components/form/submit-button'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import FormField from '~/components/form/form-field'
import FormTextInput from '~/components/form/form-text-input'

export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts()
export const { useAppForm, withForm, withFieldGroup } = createFormHook({
    fieldComponents: {
        FormItem,
        FormLabel,
        FormControl,
        FormDescription,
        FormMessage,
        FormField,
        FormTextInput
    },
    formComponents: {
        SubmitButton,
    },
    fieldContext,
    formContext,
})
