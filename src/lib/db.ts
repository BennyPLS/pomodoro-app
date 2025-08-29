import 'client-only'

import Dexie, { type EntityTable } from 'dexie'

export interface Music {
    title: string
    blob: Blob
    order: number
}

export interface TimerSession {
    id?: number
    type: 'work' | 'break' | 'longBreak'
    startedAt: Date
    endedAt: Date
    durationSec: number
}

export const db = new Dexie('db') as Dexie & {
    music: EntityTable<Music, 'title'>
    timerSessions: EntityTable<TimerSession, 'id'>
}

db.version(1).stores({
    music: 'title, order',
    timerSessions: '++id, startedAt, type',
})

export default db
