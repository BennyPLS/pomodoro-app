'use client'
import { Timer } from '~/app/_components/timer'
import { TopBar } from '~/app/_components/top-bar'
import { BottomBar } from '~/app/_components/bottom-bar'

export default function Home() {
    return (
        <div className="flex h-svh w-screen flex-col">
            <TopBar />
            <main className="flex grow items-center justify-center gap-4">
                <Timer />
            </main>
            <BottomBar />
        </div>
    )
}
