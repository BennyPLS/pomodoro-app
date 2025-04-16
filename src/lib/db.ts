import 'client-only'

import Dexie, { type EntityTable } from 'dexie'

export interface Music {
    title: string
    blob: Blob
}

export const db = new Dexie('db') as Dexie & {
    music: EntityTable<
        Music,
        'title' // primary key "id" (for the typings only)
    >
}

db.version(1).stores({
    music: 'title',
})

export default db
