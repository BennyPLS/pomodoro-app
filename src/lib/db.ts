import 'client-only'

import Dexie, { type EntityTable } from 'dexie'

export interface Music {
    title: string
    blob: Blob
    order?: number
}

export const db = new Dexie('db') as Dexie & {
    music: EntityTable<
        Music,
        'title' // primary key "id" (for the typings only)
    >
}

db.version(1).stores({
    music: 'title, order',
})

// Default song titles from the public folder
const DEFAULT_SONGS = [
    'a-cozy-day',
    'cafe-theme',
    'chill-lofi',
    'close-study',
    'mental-drive-lofi',
    'night-coffee-shop',
    'sunrise-meditation'
] as const;

// Map song filenames to human-readable titles
const DEFAULT_SONG_TITLES: Record<typeof DEFAULT_SONGS[number], string> = {
    'a-cozy-day': 'A Cozy Day',
    'cafe-theme': 'Café Theme',
    'chill-lofi': 'Chill Lo-Fi',
    'close-study': 'Close Study',
    'mental-drive-lofi': 'Mental Drive Lo-Fi',
    'night-coffee-shop': 'Night Coffee Shop',
    'sunrise-meditation': 'Sunrise Meditation'
};


export async function insertDefaultSongs() {
    // Check if we already have songs in the database
    const count = await db.music.count()

    // Only add default songs if the database is empty
    if (count === 0) {
        console.log('Inserting default songs into database...')

        for (let i = 0; i < DEFAULT_SONGS.length; i++) {
            const songId = DEFAULT_SONGS[i]!
            const songTitle = DEFAULT_SONG_TITLES[songId]
            const songPath = `/music/${songId}.mp3`

            try {
                // Fetch the MP3 file
                const response = await fetch(songPath)
                if (!response.ok) throw new Error(`Failed to fetch ${songPath}`)

                const blob = await response.blob()

                // Insert into database with order
                await db.music.add({
                    title: songTitle,
                    blob: blob,
                    order: i,
                })

                console.log(`Added default song: ${songTitle}`)
            } catch (error) {
                console.error(`Error adding song ${songTitle}:`, error)
            }
        }

        console.log('Default songs added successfully!')
    } else {
        console.log('Database already contains songs, skipping default song insertion.')
    }
}

// Ensure all music items have an order
db.on('ready', async () => {
    // Get all music items
    const allMusic = await db.music.toArray()

    // Check if any music items don't have an order
    const musicWithoutOrder = allMusic.filter(m => m.order === undefined)

    if (musicWithoutOrder.length > 0) {
        // Assign orders to music items that don't have one
        const highestOrder = allMusic.length > 0
            ? Math.max(...allMusic.map(m => m.order ?? 0))
            : -1

        let nextOrder = highestOrder + 1

        // Update each music item without an order
        for (const music of musicWithoutOrder) {
            await db.music.update(music.title, { order: nextOrder })
            nextOrder++
        }
    }

    // Insert default songs if the database is empty
    await insertDefaultSongs()
})

export default db