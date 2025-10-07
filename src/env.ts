import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_ENV: z.enum(['development', 'production']).default('development'),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
