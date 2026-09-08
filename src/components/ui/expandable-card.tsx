import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ExpandableCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <Card className="gap-0 py-0 shadow-none">
      <Button
        variant="ghost"
        className="h-auto w-full justify-between gap-3 px-3 py-3 text-left whitespace-normal"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
      <CardContent id={id} hidden={!open} className="px-3 pt-1 pb-4">
        {children}
      </CardContent>
    </Card>
  )
}
