# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

```bash
npx tsc          # compile src/game.ts → public/game.js
npx tsc --watch  # watch mode during development
```

The `tsconfig.json` has `rootDir`/`outDir` commented out — the source is `src/game.ts` and the compiled output is `public/game.js` (served directly from `public/`). Open `public/index.html` in a browser to run the game. There is no bundler, dev server, or test suite.

## Architecture

This is a single-file vanilla TypeScript game with no framework, no imports, and no bundler. All logic lives in `src/game.ts`, compiled to `public/game.js`.

### Screen flow

```
Instructions Popup → Main Menu → Start Screen → Gameplay Screen → Game Over Screen → Score Screen → Leaderboard Screen
```

Screens are toggled by adding/removing `hidden` class. `showScreen()` hides all screens then reveals one; `showScreenWithFade()` adds a `fade-in` CSS animation.

### Game modes

- **Sudden Death**: Timer counts down from 1.000s. Tapping deducts remaining time from `maxTime` (the new ceiling), resetting the timer. Missing zero ends the game.
- **One Tap**: Two-tap cycle — first tap stops the clock and scores, second tap (after a 2s lockout) triggers a 3-2-1 countdown before the next round. Three lives; missing a round costs a life.

### Scoring tiers

Time remaining at tap → tier → points: PERFECT ≤0.005 → 500, GREAT ≤0.050 → 50, GOOD ≤0.100 → 25, FINE ≤0.200 → 10, POOR ≤0.350 → 5, BAD ≤0.500 → 0.

### State

All game state is module-level variables (no class, no reactive framework). `requestAnimationFrame` drives the game loop via `gameLoop()`.

### localStorage keys

All prefixed `timedebt_`: `userid`, `initials`, `instructions_seen`, `mode`, `ring`, `best_YYYY-MM` (monthly personal best), `submitted_YYYY-MM` (one submission allowed per month).

### Pending integrations

Supabase leaderboard is stubbed with `// TODO: Send to Supabase` and `// TODO: Fetch from Supabase` comments in `submitScore()` and `showLeaderboard()`. Currently shows a local placeholder row.

## Commands

When Jon says "backup", run: `git add . && git commit -m "checkpoint before claude code"`
- When Jon says "commit to github", run: `npx tsc && git add . && git commit -m "[brief description of changes]" && git push`
