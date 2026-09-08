export function ErrorMessages({ errors }: { errors: Array<string | { message: string }> }) {
  return (
    <>
      {errors.length > 0 && (
        <div className="text-destructive flex flex-col gap-2 font-bold">
          {errors.map((error) => (
            <em key={typeof error === 'string' ? error : error.message}>
              {typeof error === 'string' ? error : error.message}
            </em>
          ))}
        </div>
      )}
    </>
  )
}
