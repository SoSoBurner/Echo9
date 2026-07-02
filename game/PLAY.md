# Playing Echo9 locally

```bash
cd game
npm run play
```

That builds the production bundle and opens your browser at `http://localhost:4173/`. `Ctrl-C` in the terminal to stop the server.

## Save data

Autosave and comfort settings persist across launches — feels like a real game where you close and come back later.

To start fresh, clear localStorage in your browser devtools:
- Chrome/Edge: F12 → Application → Storage → Clear site data
- Or manually delete keys `echo9:autosave` and `echo9:comfort` under Local Storage

## What this is (and isn't)

- **This is:** a way to sit down and playtest the built production bundle exactly as it will behave when hosted on any static server.
- **This isn't:** the itch.io upload artifact. That zip is generated separately when the vertical slice is ready to publish.

## Why preview and not dev

`npm run play` uses `vite preview` (the production build), not `npm run dev` (the hot-reload dev server). Playtesting the production bundle catches build-only regressions the dev server hides. If you want hot-reload while iterating on code, use `npm run dev` instead.
