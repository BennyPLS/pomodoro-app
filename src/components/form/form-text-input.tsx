import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import FormField, { FormFieldProps } from '~/components/form/form-field'
import { useFieldContext } from '~/hooks/use-app-form'

interface FormTextInputProps extends Omit<FormFieldProps, 'children'> {
    placeholder?: string
    type?: 'input' | 'textarea'
    disabled?: boolean
}

export default function FormTextInput({ placeholder, type = 'input', disabled = false, ...formField }: FormTextInputProps) {
    const {
        handleBlur,
        handleChange,
        state: { value },
    } = useFieldContext<string>()

    return (
        <FormField {...formField}>
            {type === 'input' ? (
                <Input
                    value={value}
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            ) : (
                <Textarea
                    value={value}
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            )}
        </FormField>
    )
}
