import { v7 } from 'uuid'
import { Clipboard, Plus, X } from 'lucide-react'
import { useAppForm } from '@/hooks/form'
import db from '@/lib/db'
import { NON_EMPTY_STRING } from '@/lib/validators'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { Form } from '@/components/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function TaskItemCreation({
  parent,
  onCreation,
  onCancel,
}: {
  parent?: string
  onCreation?: () => void
  onCancel?: () => void
}) {
  const form = useAppForm({
    defaultValues: { name: '', parent: parent },
    onSubmit: async ({ value }) => {
      await db.tasks.add({
        uuid: v7(),
        name: NON_EMPTY_STRING.parse(value.name),
        status: 'todo',
        parent: value.parent,
      })
      onCreation?.()
    },
  })

  return (
    <Item variant="outline" size="sm" className={cn({ 'ml-10': parent !== undefined })} asChild>
      <Form form={form} className="flex-row">
        <ItemMedia>
          <div className="border-input inline-flex size-9 items-center justify-center rounded-md border">
            <Clipboard className="text-chart-3 size-4" />
          </div>
        </ItemMedia>
        <ItemContent>
          <form.Field
            name="name"
            validators={{ onChange: NON_EMPTY_STRING }}
            children={(field) => (
              <Input
                autoFocus
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void form.handleSubmit()
                }}
              />
            )}
          />
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="icon" type="submit">
            <Plus />
          </Button>
          <Button variant="outline-destructive" size="icon" type="reset" onClick={() => onCancel?.()}>
            <X />
          </Button>
        </ItemActions>
      </Form>
    </Item>
  )
}
