import { useState } from 'react'
import { Clipboard, ClipboardCheck, ClipboardClock, GitBranch, Trash } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/db'
import type { IconComponent } from '@/lib/types'
import db from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { TaskItemCreation } from '@/routes/tasks/-task-item-creation'

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

export default function TaskItem({
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
      <div className="ml-10 flex flex-col gap-2">
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
