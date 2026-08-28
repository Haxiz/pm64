# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run dev server (localhost:3000)
- `npm run build` — production build to `build/`
- `npm test` — run CRA/Jest test runner in watch mode (`npm test -- --watchAll=false` for a single run; `npm test -- FightTabs` to filter by name)
- `npm run deploy` — build and publish `build/` to GitHub Pages (`gh-pages`)

No lint script is defined; ESLint runs via `react-scripts` (config: `eslintConfig` in `package.json`, extends `react-app`).

## Architecture

This is a Create React App (TypeScript) + Mantine UI app. It's a single-purpose
calculator: it predicts Bowser's move probabilities turn-by-turn during Paper
Mario 64's final Bowser fight, by re-implementing the fight's decision logic
from the decompiled game scripts.

**`src/Logic/final_bowser_1.c` and `final_bowser_2.c`** are decompiled source
from the actual game (Phase 1 = pre-Twink, Phase 2 = post-Twink AI). They are
the ground truth the calculator's logic is validated against — not app code.

**`Logic.md`** (repo root) is the authoritative mapping between the game
scripts and the calculator's implementation. Read it before touching
prediction logic in `FightTabs.tsx` — it documents the counter-timing offset
(the game increments turn counters at the *start* of a turn; the calculator
increments them at the *end* of the previous turn, so most `> 0` / `> 1`
thresholds in the calculator are shifted by one compared to the game's
`IfGe`/`IfGt` checks) and the full attack-selection probability tree (heal
check → shield/Star Rod re-enchant → shockwave/thunder gates → regular attack
pool). Any change to prediction behavior should update `Logic.md` alongside
the code.

**`FightTabs.tsx`** (`src/Pages/Final-Bowser/Components/`) is the core
component: it owns fight state (`fightData`) and implements `handleNextTurn`
(applies a turn, mutates counters, advances phase) and `handlePredictions`
(computes Bowser's next-action probabilities as a percentage pool that gets
depleted by each successive check — heal, shield, shockwave/thunder, then
stomp/claw/fire). `PhaseOne.tsx` / `PhaseTwo.tsx` render fight state per
phase; `BowserHPHandler.tsx`, `MarioHPHandler.tsx`, `MarioFPHandler.tsx`,
`BowserActionHandler.tsx`, `MarioActionHandler.tsx`, `PartnerActionHandler.tsx`
are the input controls that mutate `fightData`.

**Types** (`src/Types/`) define the fight state shape: `bowser.types.ts`
(`BowserI`, including `turnsInfo`/`BowserTurns.types.ts` and
`actionChances`/`bowserActions.types.ts`), `mario.type.ts`, `partner.types.ts`.
These mirror the actor-variable (AVAR) state tracked by the game scripts.

**`src/Services/`** holds pure helpers: `Actions/` (boot/hammer/number
upgrade logic — item tier progression), `Utils/Notifications/` (thin
wrappers around Mantine's notification system for success/warning/error
toasts).

**Routing/shell**: `App.tsx` sets up Mantine's theme + dark mode (persisted
to `localStorage`) and renders `Home.tsx`, which hosts `MantineShell.tsx`
(header/navbar chrome) and routes into `FinalBowser.tsx` via
`react-router-dom` (see `Routes/BasicRedirect.tsx`).

Deployment is static: GitHub Actions (`.github/workflows/`) builds and
publishes to GitHub Pages on push to `master`.
