'use client'

import * as React from 'react'
import { type ComponentProps } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '~/lib/utils'

export type LabelVariants = VariantProps<typeof labelVariants>
const labelVariants = cva(
    'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    {
        variants: {
            type: {
                default: '',
                destructive: 'text-destructive',
            },
        },
        defaultVariants: {
            type: 'default',
        },
    }
)

export const Label = ({
    ref,
    className,
    type,
    ...props
}: ComponentProps<typeof LabelPrimitive.Root> & LabelVariants) => (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ type }), className)} {...props} />
)

Label.displayName = LabelPrimitive.Root.displayName
