import {
  ChartBar,
  Check,
  ClipboardClock,
  ClipboardList,
  Dumbbell,
  EyeClosed,
  Plus,
  Timer as TimerIcon,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/providers/music-provider'
import useTimer from '@/providers/timer-provider'
import db from '@/lib/db'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Field, FieldLabel } from '@/components/ui/field'

export function BottomBar() {
  const [oldVolume, setOldVolume] = useState(0)
  const [volume, setVolume] = useMusicPlayer((store) => [store.volume, store.setVolume])
  return (
    <div className="bg-card/80 z-30 flex w-full items-center gap-2 border-t p-4 shadow-lg backdrop-blur sm:justify-center">
      {/* Session Statistics */}
      <SessionDrawerStatistics />
      {/* Volume Control */}
      <div className="flex grow justify-center gap-2">
        <Button
          size="icon"
          onClick={() => {
            if (volume === 0) {
              setOldVolume(0)
              setVolume(oldVolume)
            } else {
              setOldVolume(volume)
              setVolume(0)
            }
          }}
        >
          {volume > 0.66 ? <Volume2 /> : volume > 0.33 ? <Volume1 /> : volume !== 0 ? <Volume /> : <VolumeX />}
        </Button>
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={(value) => setVolume(value[0])}
          className="sm:w-80"
        />
      </div>
      <TaskDrawer />
    </div>
  )
}

function SessionDrawerStatistics() {
  const [total, work, rest] = useTimer((store) => [
    store.browserSessionTotalSec,
    store.browserSessionWorkSec,
    store.browserSessionRestSec,
  ])

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="border-muted-foreground/20 shadow-sm">
          <ChartBar />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Estadísticas de la sesión</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 text-center shadow-sm">
                <TimerIcon className="text-chart-3 size-8" />
                <div className="text-muted-foreground text-sm">Total</div>
                <div className="text-xl font-semibold">
                  {Math.floor(total / 60)} min <br />
                  {Math.floor(total % 60)} sec
                </div>
              </div>
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 text-center shadow-sm">
                <Dumbbell className="text-chart-1 size-8" />
                <div className="text-muted-foreground text-sm">Trabajando</div>
                <div className="text-xl font-semibold">
                  {Math.floor(work / 60)} min <br />
                  {Math.floor(work % 60)} sec
                </div>
              </div>
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 text-center shadow-sm">
                <EyeClosed className="text-chart-2 size-8" />
                <div className="text-muted-foreground text-sm">Descansando</div>
                <div className="text-xl font-semibold">
                  {Math.floor(rest / 60)} min <br />
                  {Math.floor(rest % 60)} sec
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function TaskDrawer() {
  const taskNameInputRef = useRef<HTMLInputElement>(null)
  const tasks = useLiveQuery(() => db.tasks.toArray())

  const addTask = async () => {
    if (!taskNameInputRef.current) return
    const name = taskNameInputRef.current.value
    if (!name || name.trim().length < 1) return
    await db.tasks.add({ name })
    taskNameInputRef.current.value = ''
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') void addTask()
  }

  const markAsCompleted = async (id: number) => {
    await db.tasks.delete(id)
  }

  return (
    <Drawer>
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
          <Field>
            <FieldLabel htmlFor="task-name">Añadir tarea</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="task-name"
                placeholder="Estudiar Matematicas"
                ref={taskNameInputRef}
                onKeyDown={onKeyDown}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" onClick={addTask}>
                  <Plus />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <div className="flex flex-grow flex-col gap-2 overflow-y-scroll p-4">
            {tasks?.map((task) => {
              return (
                <Item key={task.id} variant="outline" size="sm">
                  <ItemMedia>
                    <ClipboardClock className="size-5" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{task.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Button variant="outline" size="icon" onClick={() => markAsCompleted(task.id!)}>
                      <Check className="size-4" />
                    </Button>
                  </ItemActions>
                </Item>
              )
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
