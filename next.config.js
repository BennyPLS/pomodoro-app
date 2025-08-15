import './src/env.js'

/** @type {import('next').NextConfig} */
const config = {
    experimental: {
        reactCompiler: true,
    },
    output: 'export',
    basePath: process.env.BASE_PATH
}

export default config
