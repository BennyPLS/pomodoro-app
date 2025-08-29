import React, { ReactNode } from 'react'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '~/components/ui/form'

export type FormFieldProps = {
    children: ReactNode
    label: string
    description?: string
    isRequired?: boolean
}
export default function FormField({ children, label, description, isRequired = false }: FormFieldProps) {
    return (
        <FormItem>
            <FormLabel>
                {label}
                {isRequired && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>{children}</FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
        </FormItem>
    )
}
