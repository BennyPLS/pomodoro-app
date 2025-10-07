import { Moon, Sun, SunMoon } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { Theme } from '@/providers/theme-provider.tsx'
import { useTheme } from '@/providers/theme-provider.tsx'
import { Button } from '@/components/ui/button'

type Icon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

const THEMES_ICONS: Record<Theme, Icon> = {
  system: SunMoon,
  light: Sun,
  dark: Moon,
}

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const ThemeIcon = THEMES_ICONS[theme]

  const handleClick = () => {
    switch (theme) {
      case 'system':
        setTheme('light')
        break
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('system')
        break
    }
  }

  return (
    <Button size="icon" onClick={handleClick}>
      <ThemeIcon className="size-8" />
    </Button>
  )
}
