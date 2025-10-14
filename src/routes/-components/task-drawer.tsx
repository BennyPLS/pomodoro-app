import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Clipboard, ClipboardCheck, ClipboardClock, ClipboardList, GitBranch, Plus, Trash, X } from 'lucide-react'
import { v7 } from 'uuid'
import type { Task, TaskStatus } from '@/lib/db'
import type { IconComponent } from '@/lib/types'
import db from '@/lib/db'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Input } from '@/components/ui/input'
import { useAppForm } from '@/hooks/form'
import { cn } from '@/lib/utils'
import { Form } from '@/components/form'
import { NON_EMPTY_STRING } from '@/lib/validators'

const STATUS_CYCLE: Array<TaskStatus> = ['todo', 'in_progress', 'done']
const STATUS_ICONS: Record<TaskStatus, IconComponent> = {
  todo: Clipboard,
  in_progress: ClipboardClock,
  done: ClipboardCheck,
}

function getNextStatus(status: TaskStatus): TaskStatus {
  const idx = STATUS_CYCLE.indexOf(status)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

export function TaskDrawer() {
  const groupedTasks = useLiveQuery(async () => {
    const tasks = await db.tasks.toArray()
    return tasks
      .filter((t) => t.parent === undefined)
      .map((rt) => {
        return { ...rt, tasks: tasks.filter((t) => t.parent === rt.uuid) }
      })
  })

  const [isAdding, setIsAdding] = useState(false)

  const remove = async (uuid: string) => {
    await db.tasks.bulkDelete([uuid, ...(groupedTasks?.find((t) => t.uuid === uuid)?.tasks.map((t) => t.uuid) ?? [])])
  }

  return (
    <Drawer onOpenChange={() => setIsAdding(false)}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="border-muted-foreground/20 shadow-sm">
          <ClipboardList />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 overflow-hidden">
          <DrawerHeader>
            <DrawerTitle>Tareas</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-grow flex-col gap-2 overflow-y-scroll p-4">
            {groupedTasks?.map((task) => (
              <TaskItem key={task.uuid} task={task} remove={remove} />
            ))}
            {isAdding ? (
              <TaskItemCreation onCreation={() => setIsAdding(false)} onCancel={() => setIsAdding(false)} />
            ) : (
              <Button className="w-full" onClick={() => setIsAdding(true)}>
                <Plus />
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function TaskItem({
  task,
  remove,
}: {
  task: Task & { tasks: Array<Task> }
  remove: (id: string) => void | Promise<void>
}) {
  const [subTaskAdd, setSubTaskAdd] = useState(false)

  const handleStatusChange = async (uuid: string, status: TaskStatus) => {
    const next = getNextStatus(status)
    await db.tasks.update(uuid, { status: next })
  }

  const StatusIcon = STATUS_ICONS[task.status]

  return (
    <>
      <Item key={task.uuid} variant="outline" size="sm">
        <ItemMedia>
          <Button variant="outline" size="icon" onClick={() => handleStatusChange(task.uuid, task.status)}>
            <StatusIcon />
          </Button>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{task.name}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="icon" onClick={() => setSubTaskAdd(true)}>
            <GitBranch />
          </Button>
          <Button variant="outline-destructive" size="icon" onClick={() => remove(task.uuid)}>
            <Trash />
          </Button>
        </ItemActions>
      </Item>
      <div className="ml-10 flex flex-col">
        {task.tasks.map((t) => {
          const StatusIcon = STATUS_ICONS[t.status]

          return (
            <Item key={t.uuid} variant="outline" size="sm">
              <ItemMedia>
                <Button variant="outline" size="icon" onClick={() => handleStatusChange(t.uuid, t.status)}>
                  <StatusIcon />
                </Button>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{t.name}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button variant="outline-destructive" size="icon" onClick={() => remove(t.uuid)}>
                  <Trash />
                </Button>
              </ItemActions>
            </Item>
          )
        })}
      </div>
      {subTaskAdd && (
        <TaskItemCreation
          parent={task.uuid}
          onCreation={() => setSubTaskAdd(false)}
          onCancel={() => setSubTaskAdd(false)}
        />
      )}
    </>
  )
}
function TaskItemCreation({
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
            <Clipboard className="size-4" />
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
