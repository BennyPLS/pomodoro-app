import type { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { cn } from '~/lib/utils'
import { Input } from '~/components/ui/input'
import { type ReactNode } from 'react'

interface SimpleFormFieldProps<TFieldValues extends FieldValues, TContext> {
    control: Control<TFieldValues, TContext>
    name: Path<TFieldValues>
    label: string | ReactNode
    className?: string
    min?: number
    max?: number
}

export default function SimpleFormNumberInput<TFieldValues extends FieldValues, TContext>({
    control,
    name,
    label,
    className,
    min,
    max,
}: SimpleFormFieldProps<TFieldValues, TContext>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('w-full', className)}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input min={min} max={max} value={field.value} type="number" onChange={field.onChange} />
                    </FormControl>
                    <FormMessage className="text-wrap" />
                </FormItem>
            )}
        />
    )
}
