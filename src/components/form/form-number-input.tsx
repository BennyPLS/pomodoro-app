import FormField, { FormFieldProps } from '~/components/form/form-field'
import { Input } from '~/components/ui/input'
import { useFieldContext } from '~/hooks/use-app-form'

interface FormNumberInput extends Omit<FormFieldProps, 'children'> {
    placeholder?: string
    disabled?: boolean
    min?: number
    max?: number
}
export default function FormNumberInput({ min, max, disabled, placeholder, ...formField }: FormNumberInput) {
    const {
        handleBlur,
        handleChange,
        state: { value },
    } = useFieldContext<number>()

    return (
        <FormField {...formField}>
            <Input
                value={value}
                onBlur={handleBlur}
                type='number'
                onChange={(e) => handleChange(Number(e.target.value))}
                placeholder={placeholder}
                disabled={disabled}
            />
        </FormField>
    )
}
