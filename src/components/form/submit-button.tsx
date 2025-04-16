import { type MouseEventHandler } from 'react'
import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'

export default function SubmitButton({
  isLoading,
  disabled,
  onClick,
}: {
  isLoading: boolean
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}) {
  return (
    <Button className="mt-4" onClick={onClick} type="submit" disabled={isLoading || disabled}>
      {isLoading ? <Spinner className="text-foreground" /> : <>Guardar</>}
    </Button>
  )
}
