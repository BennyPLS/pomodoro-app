import type {
    Control,
    ControllerFieldState,
    ControllerRenderProps,
    FieldValues,
    Path,
    UseFormStateReturn,
} from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { cn } from '~/lib/utils'
import { type ReactNode } from 'react'

type RenderFunctionInput<TFieldValues extends FieldValues> = {
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<TFieldValues>
}

interface SimpleFormFieldProps<TFieldValues extends FieldValues, TContext> {
    control: Control<TFieldValues, TContext>
    name: Path<TFieldValues>
    label: string | ReactNode
    className?: string
    render: (input: RenderFunctionInput<TFieldValues>) => ReactNode
}

export default function SimpleFormField<TFieldValues extends FieldValues, TContext>({
    control,
    name,
    label,
    className,
    render,
}: SimpleFormFieldProps<TFieldValues, TContext>) {
    return (
        <FormField
            control={control}
            name={name}
            render={(input) => (
                <FormItem className={cn('w-full', className)}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>{render(input)}</FormControl>
                    <FormMessage className="text-wrap" />
                </FormItem>
            )}
        />
    )
}
