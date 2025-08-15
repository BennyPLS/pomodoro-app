import './src/env.js'

/** @type {import('next').NextConfig} */
const config = {
    experimental: {
        reactCompiler: true,
    },
    output: 'export',
    basePath: 'pomodoro-app'
}

export default config
