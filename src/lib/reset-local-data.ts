import db from '@/lib/db'

/**
 * Wipes every trace of app state on this device: the Dexie database (music,
 * sessions, tasks) and the browser storage holding preferences (appearance,
 * language, volume, stats layout). The next load starts from the defaults.
 *
 * The database goes first because it is the only step that can realistically
 * fail, and callers should reload the page afterwards so every provider
 * re-initialises from scratch.
 */
export async function resetLocalData() {
  await db.delete()
  window.localStorage.clear()
  window.sessionStorage.clear()
}
