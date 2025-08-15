import { Button } from '~/components/ui/button'
import { Loader2, Pause, Play, Settings, SkipForward } from 'lucide-react'
import { Slider } from '~/components/ui/slider'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Music } from '~/lib/db'

export interface TopNavBarProps {
    isPlaying: boolean
    actualMusic: Music | undefined
    nextMusic: () => void
    playMusic: () => void
    pauseMusic: () => void
    progress: number
    duration: number
    seek: (value: number) => void
}

const ThemeSelector = dynamic(() => import('~/components/theme-selector'), {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" />,
})

export function TopNavBar({ nextMusic, playMusic, pauseMusic, actualMusic, progress, duration, isPlaying, seek }: TopNavBarProps) {
    return (
        <nav className="flex gap-4 border-b p-4">
            <div className="flex justify-start gap-4">
                <ThemeSelector />
            </div>
            <div className="flex grow flex-col justify-center gap-4">
                <div className="flex justify-center gap-4">
                    <Button size="icon" onClick={playMusic} disabled={isPlaying}>
                        <Play />
                    </Button>
                    <Button size="icon" onClick={pauseMusic} disabled={!isPlaying}>
                        <Pause />
                    </Button>
                    <Button size="icon" onClick={nextMusic}>
                        <SkipForward />
                    </Button>
                </div>
                <div className="text-center">{actualMusic?.title ?? 'No Selected'}</div>
                {/* Progress slider */}
                <div className="flex w-full px-4 sm:justify-center">
                    <Slider
                        value={[progress]}
                        max={duration}
                        step={0.1}
                        onValueChange={(value) => seek(value[0]!)}
                        className="sm:w-56"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-4">
                <Button size="icon" asChild>
                    <Link href="/settings">
                        <Settings />
                    </Link>
                </Button>
            </div>
        </nav>
    )
}
