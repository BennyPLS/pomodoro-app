import { motion, useAnimate } from 'motion/react'
import { useEffect, useState } from 'react'
import { Clipboard, ClipboardCheck, ClipboardClock, ClipboardPlus, Trash2 } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { Task, TaskStatus } from '@/lib/db'
import type { IconComponent } from '@/lib/types'
import type { PanInfo } from 'motion'
import { m } from '@/lib/i18n'
import db from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'
import { TaskItemCreation } from '@/routes/tasks/-task-item-creation'
import { Input } from '@/components/ui/input'

const STATUS_CYCLE: Array<TaskStatus> = ['todo', 'doing', 'done']
const STATUS_ICONS: Record<TaskStatus, IconComponent> = {
  todo: Clipboard,
  doing: ClipboardClock,
  done: ClipboardCheck,
}

function getNextStatus(status: TaskStatus): TaskStatus {
  const idx = STATUS_CYCLE.indexOf(status)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

export default function TaskItem({
  task,
  remove,
  subTaskAdd,
  setSubTaskAdd,
}: {
  task: Task & { tasks?: Array<Task> }
  remove: (id: string) => void | Promise<void>
  subTaskAdd: string | null
  setSubTaskAdd: (uuid: string | null) => void
}) {
  const [scope, animate] = useAnimate()
  const [inputValue, setInputValue] = useState(task.name)

  const handleStatusChange = async (uuid: string, status: TaskStatus) => {
    const next = getNextStatus(status)
    await db.tasks.update(uuid, { status: next })
  }

  const StatusIcon = STATUS_ICONS[task.status]

  const handleDragEnd = (_event: never, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > 100 || velocity > 500) {
      animate(scope.current, { x: '100%' }, { duration: 0.2 })
      setTimeout(() => remove(task.uuid), 200)
    } else {
      animate(scope.current, { x: 0, opacity: 1 }, { duration: 0.5 })
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      db.tasks.update(task.uuid, { name: inputValue })
    }, 300)

    return () => clearTimeout(timeout)
  }, [inputValue, task.uuid])

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
  }

  return (
    <>
      <Item key={task.uuid} variant="outline" size="sm" asChild>
        <motion.div
          drag="x"
          ref={scope}
          dragConstraints={{ top: 0, bottom: 0, left: 0 }}
          whileDrag={{ cursor: 'grabbing' }}
          onDragEnd={handleDragEnd}
        >
          <ItemMedia>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleStatusChange(task.uuid, task.status)}
              aria-label={m.change_task_status()}
              data-status={task.status}
              className='data-[status="todo"]:text-chart-3 data-[status="doing"]:text-chart-4 data-[status="done"]:text-chart-1'
            >
              <StatusIcon />
            </Button>
          </ItemMedia>
          <ItemContent>
            <Input aria-label={m.task_name()} value={inputValue} onChange={handleOnChange} />
          </ItemContent>
          <ItemActions>
            {task.tasks !== undefined && (
              <Button
                variant="outline"
                size="icon"
                aria-label={m.add_subtask()}
                onClick={() => setSubTaskAdd(task.uuid)}
              >
                <ClipboardPlus />
              </Button>
            )}
            <Button
              variant="outline-destructive"
              size="icon"
              aria-label={m.delete_task()}
              onClick={() => void remove(task.uuid)}
            >
              <Trash2 />
            </Button>
          </ItemActions>
        </motion.div>
      </Item>
      {task.tasks !== undefined && (
        <>
          <div className="ml-10 flex flex-col gap-2">
            {task.tasks.map((t) => {
              return (
                <TaskItem key={t.uuid} task={t} remove={remove} subTaskAdd={subTaskAdd} setSubTaskAdd={setSubTaskAdd} />
              )
            })}
          </div>
          {subTaskAdd === task.uuid && (
            <TaskItemCreation
              parent={task.uuid}
              onCreation={() => setSubTaskAdd(null)}
              onCancel={() => setSubTaskAdd(null)}
            />
          )}
        </>
      )}
    </>
  )
}
