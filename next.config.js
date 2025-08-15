/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

/** @type {import('next').NextConfig} */
const config = {
    experimental: {
        reactCompiler: true,
    },
    output: 'export',
    basePath: process.env.PAGES_BASE_PATH,
}

export default config
