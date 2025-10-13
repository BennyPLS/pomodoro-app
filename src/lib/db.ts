import Dexie from 'dexie'
import type { EntityTable } from 'dexie'
import type { IndividualMode } from '@/providers/timer-provider'

export interface Music {
  title: string
  blob: Blob
  order: number
}

export interface Session {
  id?: number
  uuid: string
  type: IndividualMode
  startedAt: Date
  endedAt: Date
  // seconds
  duration: number
  completed: boolean
}

export interface Tasks {
  id?: number
  name: string
}

export const db = new Dexie('db') as Dexie & {
  music: EntityTable<Music, 'title'>
  sessions: EntityTable<Session, 'id'>
  tasks: EntityTable<Tasks, 'id'>
}

db.version(1).stores({
  music: 'title, order',
  sessions: '++id, startedAt, type',
  tasks: '++id',
})

export default db
