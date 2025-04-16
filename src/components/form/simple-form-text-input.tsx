import { type Control, type FieldValues, type Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

interface SimpleTextInputProps<TFieldValues extends FieldValues, TContext> {
    control: Control<TFieldValues, TContext>
    name: Path<TFieldValues>
    label: string
    placeholder?: string
    className?: string
    type?: 'input' | 'textarea'
    disabled?: boolean
}

export default function SimpleFormTextInput<TFieldValues extends FieldValues, TContext>({
    control,
    name,
    label,
    placeholder,
    className,
    type = 'input',
    disabled = false,
}: SimpleTextInputProps<TFieldValues, TContext>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        {type === 'input' ? (
                            <Input {...field} placeholder={placeholder} disabled={disabled} />
                        ) : (
                            <Textarea {...field} placeholder={placeholder} disabled={disabled} />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
