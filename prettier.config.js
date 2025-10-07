//  @ts-check

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */ const config = {
  semi: false,
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'all',
  tailwindFunctions: ['cva', 'cn'],
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
