import { z } from 'zod'
import { m } from '@/lib/i18n'

export const NON_EMPTY_STRING = z
  .string()
  .trim()
  .min(1, { error: () => m.required() })
