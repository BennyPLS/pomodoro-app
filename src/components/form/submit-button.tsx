import { useFormContext } from '@/hooks/form'

import { Button } from '@/components/ui/button'

export function SubmitButton({ label }: { label: string }) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit, state.submissionAttempts] as const}>
      {([isSubmitting, canSubmit, submissionAttempts]) => (
        <Button type="submit" className="mt-4" disabled={isSubmitting || (!canSubmit && submissionAttempts > 0)}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}
