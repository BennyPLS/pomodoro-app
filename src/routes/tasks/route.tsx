import { Link, createFileRoute } from '@tanstack/react-router'
import { ClipboardList, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import db from '@/lib/db'
import { TaskItemCreation } from '@/routes/tasks/-task-item-creation'
import TaskItem from '@/routes/tasks/-task-item'
import { m } from '@/lib/i18n'

export const Route = createFileRoute('/tasks')({
  component: RouteComponent,
})

function RouteComponent() {
  const groupedTasks = useLiveQuery(async () => {
    const tasks = await db.tasks.toArray()
    return tasks
      .filter((t) => t.parent === undefined)
      .map((rt) => {
        return { ...rt, tasks: tasks.filter((t) => t.parent === rt.uuid) }
      })
  })

  // Only one creation input may be open at a time: `null` when none is open,
  // `{}` for a new root task, or `{ parent }` for a subtask of `parent`.
  const [creating, setCreating] = useState<{ parent?: string } | null>(null)

  const remove = async (uuid: string) => {
    await db.tasks.bulkDelete([uuid, ...(groupedTasks?.find((t) => t.uuid === uuid)?.tasks.map((t) => t.uuid) ?? [])])
  }

  return (
    <div className="bg-background flex h-svh w-screen flex-col [view-transition-name:main-content]">
      <Button variant="outline" className="w-full rounded-none border-0 border-b" asChild>
        <Link aria-label={m.back()} to="/" viewTransition={{ types: ['slide-drawer-down'] }}>
          <ClipboardList />
        </Link>
      </Button>
      <div className="relative mx-auto flex w-full max-w-xl flex-col gap-4 py-4">
        <div
          aria-hidden
          className="to-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-4 bg-linear-to-l from-transparent"
        />
        <div
          aria-hidden
          className="to-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-4 bg-linear-to-r from-transparent"
        />
        <h1 className="flex items-center justify-center gap-4 px-4 text-2xl">{m.tasks()}</h1>
        <div className="flex flex-grow flex-col gap-2 overflow-x-hidden overflow-y-scroll px-4">
          {groupedTasks?.map((task) => (
            <TaskItem
              key={task.uuid}
              task={task}
              remove={remove}
              subTaskAdd={creating?.parent ?? null}
              setSubTaskAdd={(parent) => setCreating(parent === null ? null : { parent })}
            />
          ))}
          {creating !== null && creating.parent === undefined ? (
            <TaskItemCreation onCreation={() => setCreating(null)} onCancel={() => setCreating(null)} />
          ) : (
            <Button aria-label={m.add_task()} className="w-full" onClick={() => setCreating({})}>
              <Plus />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
