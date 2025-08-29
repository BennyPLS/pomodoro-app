import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'
import { useFormContext } from '~/hooks/use-app-form'

export default function SubmitButton() {
    const form = useFormContext()

    return (
        <form.Subscribe selector={(state): [boolean, boolean] => [state.isSubmitting, state.isValid]}>
            {([isSubmitting, isValid]) => (
                <Button className="mt-4" type="submit" disabled={isSubmitting || !isValid}>
                    {isSubmitting ? <Spinner className="text-foreground" /> : <>Guardar</>}
                </Button>
            )}
        </form.Subscribe>
    )
}
