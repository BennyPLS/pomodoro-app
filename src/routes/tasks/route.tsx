import { Link, createFileRoute } from '@tanstack/react-router'
import { ClipboardList, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import db from '@/lib/db'
import { TaskItemCreation } from '@/routes/tasks/-task-item-creation'
import TaskItem from '@/routes/tasks/-task-item'

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

  const [isAdding, setIsAdding] = useState(false)

  const remove = async (uuid: string) => {
    await db.tasks.bulkDelete([uuid, ...(groupedTasks?.find((t) => t.uuid === uuid)?.tasks.map((t) => t.uuid) ?? [])])
  }

  return (
    <div className="bg-background flex h-svh w-screen flex-col [view-transition-name:main-content]">
      <Button variant="outline" className="w-full rounded-none border-0 border-b" asChild>
        <Link to="/" viewTransition={{ types: ['slide-drawer-down'] }}>
          <ClipboardList />
        </Link>
      </Button>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
        <h1 className="flex items-center justify-center gap-4 text-2xl">Tareas</h1>
        <div className="flex flex-grow flex-col gap-2 overflow-y-scroll">
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
    </div>
  )
}
