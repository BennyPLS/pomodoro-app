export function ErrorMessages({ errors }: { errors: Array<string | { message: string }> }) {
  return (
    <>
      {errors.length > 0 && (
        <div className="flex flex-col gap-2 font-bold text-red-500">
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
