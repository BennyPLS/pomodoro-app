import { useState } from 'react'
import useMusicPlayer from '~/providers/music-provider'
import { Button } from '~/components/ui/button'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Slider } from '~/components/ui/slider'

export function BottomBar() {
    const [oldVolume, setOldVolume] = useState(0)
    const [volume, setVolume] = useMusicPlayer((store) => [store.volume, store.setVolume])

    return (
        <div className="flex items-center gap-2 border-t p-4 sm:justify-center">
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
                onValueChange={(value) => setVolume(value[0]!)}
                className="sm:w-56"
            />
        </div>
    )
}
