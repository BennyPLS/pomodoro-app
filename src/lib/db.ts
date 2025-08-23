import 'client-only'

import Dexie, { type EntityTable } from 'dexie'

export interface Music {
    title: string
    blob: Blob
    order?: number
}

// Add: timer session log entry
export interface TimerSession {
    id?: number
    type: 'work' | 'break' | 'longBreak'
    startedAt: Date
    endedAt: Date
    durationSec: number
}

export const db = new Dexie('db') as Dexie & {
    music: EntityTable<
        Music,
        'title' // primary key "id" (for the typings only)
    >
    // Add: table typing
    timerSessions: EntityTable<
        TimerSession,
        'id'
    >
}

db.version(1).stores({
    music: 'title, order',
})

// Add: version 2 for timerSessions
db.version(2).stores({
    music: 'title, order',
    timerSessions: '++id, startedAt, type',
})

// Ensure all music items have an order
db.on('ready', async () => {
    // Get all music items
    const allMusic = await db.music.toArray()

    // Check if any music items don't have an order
    const musicWithoutOrder = allMusic.filter((m) => m.order === undefined)

    if (musicWithoutOrder.length > 0) {
        // Assign orders to music items that don't have one
        const highestOrder = allMusic.length > 0 ? Math.max(...allMusic.map((m) => m.order ?? 0)) : -1

        let nextOrder = highestOrder + 1

        // Update each music item without an order
        for (const music of musicWithoutOrder) {
            await db.music.update(music.title, { order: nextOrder })
            nextOrder++
        }
    }
})

export default db
