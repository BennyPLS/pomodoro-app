'use client'
import { Timer } from '~/app/_components/timer'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Slider } from '~/components/ui/slider'
import { TopNavBar } from '~/app/_components/top-nav-bar'
import useMusicPlayer from '~/hooks/use-music-player'

export default function Home() {
    const { music, volume, progress, duration, isPlaying, nextMusic, playMusic, pauseMusic, handleVolumeChange, handleSeek } =
        useMusicPlayer()

    return (
        <div className="flex h-svh w-screen flex-col">
            <TopNavBar
                isPlaying={isPlaying}
                nextMusic={nextMusic}
                playMusic={playMusic}
                pauseMusic={pauseMusic}
                actualMusic={music}
                progress={progress}
                duration={duration}
                seek={handleSeek}
            />
            <main className="flex grow items-center justify-center gap-4">
                <Timer />
            </main>
            <div className="flex items-center gap-2 border-t p-4 sm:justify-center">
                <Button size="icon">
                    {volume > 0.66 ? (
                        <Volume2 />
                    ) : volume > 0.33 ? (
                        <Volume1 />
                    ) : volume !== 0 ? (
                        <Volume />
                    ) : (
                        <VolumeX />
                    )}
                </Button>
                <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleVolumeChange(value[0]!)}
                    className="sm:w-56"
                />
            </div>
        </div>
    )
}
