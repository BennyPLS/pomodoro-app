import * as React from 'react'

import { cn } from '~/lib/utils'
import { ComponentProps } from 'react'

const Textarea = ({ ref, className, ...props }: ComponentProps<'textarea'>) => {
    return (
        <textarea
            className={cn(
                'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className
            )}
            ref={ref}
            {...props}
        />
    )
}
Textarea.displayName = 'Textarea'

export { Textarea }
