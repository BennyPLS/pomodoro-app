'use client'
import { useTheme } from 'next-themes'
import { Button } from '~/components/ui/button'
import { LucideProps, Moon, Sun, SunMoon } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

type Icon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

type Theme = 'system' | 'light' | 'dark'

const THEMES_ICONS: Record<Theme, Icon> = {
    system: SunMoon,
    light: Sun,
    dark: Moon,
}

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme()

    const Icon = THEMES_ICONS[theme as Theme]

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
        <Button variant="ghost" size="icon" onClick={handleClick}>
            <Icon className="size-8" />
        </Button>
    )
}
