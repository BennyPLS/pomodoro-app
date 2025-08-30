import 'client-only'

import Dexie, { type EntityTable } from 'dexie'

export interface Music {
    title: string
    blob: Blob
    order: number
}

// Add: timer session log entry
export interface Sessions {
    id?: number
    type: 'work' | 'break' | 'longBreak'
    startedAt: Date
    endedAt: Date
    // seconds
    duration: number
}

export const db = new Dexie('db') as Dexie & {
    music: EntityTable<Music, 'title'>
    sessions: EntityTable<Sessions, 'id'>
}

db.version(1).stores({
    music: 'title, order',
    sessions: '++id, startedAt, type',
})

export default db
