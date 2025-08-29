'use client'

import type * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '~/lib/utils'
import { Label } from '~/components/ui/label'
import React, { type ComponentProps } from 'react'
import { useFieldContext } from '~/hooks/use-app-form'
import { useStore } from '@tanstack/react-form'

const FormItem = ({ ref, className, ...props }: ComponentProps<'div'>) => {
    return <div ref={ref} className={cn('flex w-full flex-col gap-2', className)} {...props} />
}

FormItem.displayName = 'FormItem'

const FormLabel = ({ ref, className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) => {
    const { store, name } = useFieldContext()
    const errors = useStore(store, (state) => state.meta.errors)

    return <Label ref={ref} type={errors.length > 0 ? 'destructive' : 'default'} htmlFor={name} {...props} />
}

FormLabel.displayName = 'FormLabel'

const FormControl = ({ ref, ...props }: ComponentProps<typeof Slot>) => {
    const { name } = useFieldContext()

    return <Slot ref={ref} id={name} aria-describedby={`${name}-description ${name}-message`} {...props} />
}

FormControl.displayName = 'FormControl'

const FormDescription = ({ ref, className, ...props }: ComponentProps<'p'>) => {
    const { name } = useFieldContext()

    return (
        <p ref={ref} id={`${name}-description`} className={cn('text-muted-foreground text-sm', className)} {...props} />
    )
}

FormDescription.displayName = 'FormDescription'

const FormMessage = ({ ref, className, children, ...props }: ComponentProps<'p'>) => {
    const { store, name } = useFieldContext()
    const errors = useStore(store, (state) => state.meta.errors)

    const body = errors.length > 0 ? String(errors.at(0)?.message ?? errors.at(0)) : children
    console.log(name, errors)

    return (
        <p
            ref={ref}
            id={`${name}-message`}
            className={cn('text-destructive h-5 text-sm font-medium', className)}
            {...props}
        >
            {body}
        </p>
    )
}

FormMessage.displayName = 'FormMessage'

export { FormItem, FormLabel, FormControl, FormDescription, FormMessage }
