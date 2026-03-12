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

### Gameplay

One unified mode. The timer counts down from 1.000s. Tapping scores the current time remaining and deducts it from `maxTime` (the new ceiling). Player has 3 lives — hitting zero costs a life; losing all 3 ends the game.

After each tap:
1. 400ms freeze (timer pauses, tap registered)
2. Bounce animation: timer fills UP to new `maxTime` if tap was good (< 50% remaining), or shrinks DOWN if tap was early (> 50% remaining)
3. 400ms pause after animation
4. Countdown resumes

The ring and bounce animations are always on (no toggles). "TOO EARLY!" appears above the timer on early taps. The timer text shifts orange below 0.300s and red below 0.100s.

### Scoring tiers

Time remaining at tap → tier → points: PERFECT ≤0.005 → 500, GREAT ≤0.050 → 50, GOOD ≤0.100 → 25, FINE ≤0.200 → 10, POOR ≤0.350 → 5, BAD ≤0.500 → 0.

### State

All game state is module-level variables (no class, no reactive framework). `requestAnimationFrame` drives the game loop via `gameLoop()`.

### localStorage keys

All prefixed `timedebt_`: `userid`, `initials`, `instructions_seen`, `best_YYYY-MM` (monthly personal best), `submitted_YYYY-MM` (one submission allowed per month).

### Pending integrations

Supabase leaderboard is stubbed with `// TODO: Send to Supabase` and `// TODO: Fetch from Supabase` comments in `submitScore()` and `showLeaderboard()`. Currently shows a local placeholder row.

## Commands

When Jon says "backup", run: `git add . && git commit -m "checkpoint before claude code"`
- When Jon says "commit to github", run: `npx tsc && git add . && git commit -m "[brief description of changes]" && git push`
