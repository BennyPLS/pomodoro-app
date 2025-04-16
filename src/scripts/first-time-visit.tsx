'use client'
import { useEffect } from 'react'
import db from '~/lib/db'

// Default song titles from the public folder
const DEFAULT_SONGS = [
    'a-cozy-day',
    'cafe-theme',
    'chill-lofi',
    'close-study',
    'mental-drive-lofi',
    'night-coffee-shop',
    'sunrise-meditation',
] as const

// Map song filenames to human-readable titles
const DEFAULT_SONG_TITLES: Record<(typeof DEFAULT_SONGS)[number], string> = {
    'a-cozy-day': 'A Cozy Day',
    'cafe-theme': 'Café Theme',
    'chill-lofi': 'Chill Lo-Fi',
    'close-study': 'Close Study',
    'mental-drive-lofi': 'Mental Drive Lo-Fi',
    'night-coffee-shop': 'Night Coffee Shop',
    'sunrise-meditation': 'Sunrise Meditation',
}

export async function insertDefaultSongs() {
    // Check if we already have songs in the database
    const count = await db.music.count()

    // Only add default songs if the database is empty
    if (count === 0) {
        console.log('Inserting default songs into database...')
        console.log(DEFAULT_SONGS.length)

        for (let i = 0; i < DEFAULT_SONGS.length; i++) {
            console.log(`Loading ${i}`)
            const songId = DEFAULT_SONGS[i]!
            const songTitle = DEFAULT_SONG_TITLES[songId]
            const songPath = `/music/${songId}.mp3`
            console.log(`Loading ${songId}`)

            try {
                // Fetch the MP3 file
                console.log(`Loading ${songId}`)

                const response = await fetch(songPath)
                console.log(`Loading ${songId}`)
                if (!response.ok) throw new Error(`Failed to fetch ${songPath}`)
                console.log(`Loaded`)

                const blob = await response.blob()
                console.log('LOADED BLOB')
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

export default function FirstTimeVisitScript() {
    useEffect(() => {
        const isFirstTime = !Boolean(localStorage.getItem('visited'))
        if (isFirstTime) {
            insertDefaultSongs().then(() => {
                localStorage.setItem('visited', 'true')
            })
        }
    }, [])

    return null
}
