import { useSyncExternalStore } from 'react'
import { z } from 'zod'
import type { locales } from '@/paraglide/runtime'
import { getLocale, setLocale as setRuntimeLocale } from '@/paraglide/runtime'
import { m as messages } from '@/paraglide/messages'

export type Messages = typeof messages
export const m = messages satisfies Messages
export type Locale = (typeof locales)[number]
export { getLocale }

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLocale() {
  return useSyncExternalStore(subscribe, getLocale, getLocale)
}

export async function setLocale(locale: Locale) {
  if (locale === getLocale()) return

  await setRuntimeLocale(locale, { reload: false })
  document.documentElement.lang = locale
  z.config(z.locales[locale]())
  listeners.forEach((listener) => listener())
}
