[Website](https://bennypls.github.io/pomodoro-app/)

## Translations

English and Spanish messages live in `messages/en.json` and `messages/es.json`.
Add matching keys and interpolation parameters to both catalogs, then use `m` from
`@/lib/i18n` in the UI. `pnpm dev` and `pnpm build` generate `src/paraglide`;
do not edit or commit that generated directory. Run a build before checking types
on a fresh checkout.

Settings includes a language selector. The app uses the saved language preference,
then the browser language, with English as the fallback. Changing language updates
the route content, validation messages, dates, and number formatting without a page
reload. The theme, running timer, and music player stay mounted.

`pnpm machine-translate` can fill missing translations; review its output before
committing.
