import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function HomeLayout({
  topBar,
  timer,
  bottomBar,
  className,
}: {
  topBar: ReactNode
  timer: ReactNode
  bottomBar: ReactNode
  className?: string
}) {
  return (
    <div className={cn('@container flex h-full w-full flex-col', className)}>
      {topBar}
      <main className="flex grow items-center justify-center gap-4 py-4">{timer}</main>
      {bottomBar}
    </div>
  )
}
