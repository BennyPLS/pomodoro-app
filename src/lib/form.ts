import { FormEvent, FormEventHandler } from 'react'
import { FormApi } from '@tanstack/form-core'

export function handleOnSubmit(
    form: FormApi<any, any, any, any, any, any, any, any, any, any, any, any>
): FormEventHandler {
    return (e: FormEvent<any>) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
    }
}
