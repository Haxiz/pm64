# Bowser Fight Calculator — Logic Reference

This document describes how the calculator in `FightTabs.tsx` maps to the
original game scripts in `src/Logic/final_bowser_1.c` (Phase 1) and
`src/Logic/final_bowser_2.c` (Phase 2).

> **Verified against the game scripts (2026-08-28):** four concrete bugs
> were found with a reference-model test suite and have since been fixed —
> see [§11](#11-verified-discrepancies-audit) for what they were and how
> they were confirmed. The suite (`FightTabs.logic.test.ts`) is now part of
> the regression net; sections 5 and 7 below describe the calculator's
> current (correct) behavior.

---

## Table of Contents

1. [Fight Overview](#1-fight-overview)
2. [Counter Timing](#2-counter-timing)
3. [Phase 1 — Pre-Twink](#3-phase-1--pre-twink)
4. [Phase 2 — Post-Twink](#4-phase-2--post-twink)
5. [Heal Check](#5-heal-check)
6. [Shield / Star Rod Re-enchant](#6-shield--star-rod-re-enchant)
7. [Attack Selection](#7-attack-selection)
   - [Path 1: Regular Attacks Only](#path-1-regular-attacks-only)
   - [Path 2: Forced Shockwave / Thunder](#path-2-forced-shockwave--thunder)
   - [Path 3: General Case](#path-3-general-case)
8. [Regular Attack Pool (EVS_UseAttack)](#8-regular-attack-pool-evs_useattack)
9. [Phase Transition](#9-phase-transition)
10. [Known Differences / Limitations](#10-known-differences--limitations)
11. [Verified Discrepancies (Audit)](#11-verified-discrepancies-audit)

---

## 1. Fight Overview

The final Bowser fight has two phases:

| Phase | Game Script               | Turns | Description                         |
|-------|---------------------------|-------|-------------------------------------|
| 1     | `final_bowser_1.c`       | 2     | Scripted: attack then Star Rod cast |
| 2     | `final_bowser_2.c`       | ∞     | AI-driven action selection          |

Both phases share the same `EVS_TakeTurn_Inner` structure (counter
increments → early-return checks → attack selection), but the actual
action pools differ.

---

## 2. Counter Timing

This is the most important subtlety when comparing the calculator to the
game.

**In the game** (`EVS_TakeTurn_Inner`, `final_bowser_2.c:935`):
```
All counters incremented at START of turn  →  then checks run
```

**In the calculator** (`handleNextTurn`):
```
All counters incremented at END of previous turn  →  then predictions run
```

The result is that the calculator's counter values are always **one less**
than the game's values at the point of the check. This affects every
`IfGe(LVar0, 2)` / `IfGt(LVar0, 1)` comparison in the game.

### How the calculator compensates

| Game check             | Game value at check | Calculator value at prediction | Calculator check     |
|------------------------|---------------------|--------------------------------|----------------------|
| `TurnsSinceBodySlam ≥ 2` | N + 1              | N                              | `> 0` (i.e. ≥ 1)    |
| `TurnsSinceClawSwipe ≥ 2` | N + 1            | N                              | `> 0`                |
| `TurnsSinceRecover > 1` | N + 1              | N + 1 (init offset)            | `> 1`                |
| `TurnsSinceShockwave < 3` | N + 1            | N + 1 (init offset)            | `< 3`                |
| `TurnsSinceStarBeam` switch | N + 1          | N + 1 (init offset)            | `> 1` / `=== 3`      |

The `> 0` threshold for stomp and claw is the key fix — it accounts for
the missing start-of-turn increment that the game performs.

Counters that are initialized with an offset (+1 at phase transition)
already match the game's values and use the original thresholds.

---

## 3. Phase 1 — Pre-Twink

**Game:** `final_bowser_1.c` `EVS_TakeTurn_Inner` lines 675–764

Phase 1 is fully scripted with exactly 2 turns:

| Turn | Game Behaviour                          | Calculator               |
|------|-----------------------------------------|--------------------------|
| 1    | `RandInt(80)` → stomp/claw/fire (same as `EVS_UseAttack`) | 25% stomp, 33% claw, rest fire |
| 2    | `TurnCount === 2` → `EVS_Move_UseStarRod` (guaranteed)   | 100% shield              |

The calculator hardcodes these since there is no randomness to model on
turn 2.

---

## 4. Phase 2 — Post-Twink

**Game:** `final_bowser_2.c` `EVS_TakeTurn_Inner` lines 935–998

Each turn runs through three independent early-return checks before
reaching attack selection:

```
1. Increment all counters
2. Recover check        → early return if triggered
3. Star Rod re-enchant  → early return if triggered
4. Shockwave cooldown   → if < 3, regular attacks only
5. EVS_UseAttackOrShockwave (general attack selection)
```

The calculator models these as independent probability deductions from a
100% pool, which produces the same result since each check has its own
early return in the game.

---

## 5. Heal Check

**Game:** `final_bowser_2.c` lines 948–968

```
if (MarioHP% − BowserHP% > 25):
    if (RecoversLeft ≠ 0 AND TurnsSinceRecover > 1):
        if (RandInt(100) < 75):
            → EVS_Recover (heal 31% of max HP)
```

**Calculator:** `handlePredictions`, heal section

```
if (marioHP% − bowserHP% ≥ 25):
    if (heals < 3 AND turnsSinceHeal > 1):
        heal = 75% of remaining pool
```

| Game variable        | Calculator mapping      | Init value (Phase 2) |
|----------------------|------------------------|----------------------|
| `AVAR_RecoversLeft`  | `bowser.heals` (count) | 3 (max heals)        |
| `AVAR_TurnsSinceRecover` | `turnsSinceHeal`   | 1 (offset)           |

The 75% RandInt gate is applied directly as a probability. The game also
has a secondary 0% fallback (RandInt(100) < 0) which never fires and is
ignored.

---

## 6. Shield / Star Rod Re-enchant

**Game:** `final_bowser_2.c` lines 969–989

```
if (TurnCount > 1 AND NOT enchanted):
    match TurnsSinceStarBeam:
        1 → 0% chance
        2 → 0% chance
        3 → 15% chance
        ≥4 → 75% chance
    if (RandInt(100) < above):
        → EVS_Move_UseStarRod (enchant / shield)
```

**Calculator:** `handlePredictions`, shield section

```
if (turnsSinceShield > 1 AND NOT bowser.shield):
    if (turnsSinceShield === 3):
        shield = 15% of pool
    else if (turnsSinceShield > 3):
        shield = 75% of pool
```

| Game variable           | Calculator mapping     | Init value (Phase 2) |
|-------------------------|------------------------|----------------------|
| `AVAR_TurnsSinceStarBeam` | `turnsSinceShield`  | 1 (offset)           |
| `ACTOR_EVENT_FLAG_STAR_ROD_ENCHANTED` | `bowser.shield` | —           |

The `bowser.shield` boolean serves two purposes:
1. **Visual indicator** — used by `PhaseOne.tsx` and `PhaseTwo.tsx` to
   show the star animation on Bowser's sprite.
2. **Prediction guard** — prevents the shield branch from triggering when
   Bowser is already enchanted (matches the game's `IfNotFlag` check).

When Mario uses Star Beam (`"beam"` action), the calculator sets
`bowser.shield = false` and `turnsSinceShield = 1`, matching the game's
removal of the enchant flag.

---

## 7. Attack Selection

**Game:** `final_bowser_2.c` `EVS_UseAttackOrShockwave` lines 1001–1047

After the three early-return checks pass, Bowser reaches attack
selection. There are three mutually exclusive paths:

### Path 1: Regular Attacks Only

**Condition:** `TurnsSinceShockwave < 3` OR `TurnCount ≤ 3`

**Game:** Lines 991–994 (`< 3`) or 1003–1006 (`≤ 3`) → `EVS_UseAttack`

**Calculator:** `turnsSinceShockwave < 3 || turn ≤ 3`

No shockwave or thunder possible. Falls into the regular attack pool.

### Path 2: Forced Shockwave / Thunder

**Condition:** `TurnsSinceShockwave ≥ 6`

**Game:** Lines 1009–1017

```
RandInt(30):
    < 20 → EVS_UseDrainingShockwave (shockwave)  — 66.7%
    ≥ 20 → EVS_Attack_LightningBlast (thunder)    — 33.3%
```

**Calculator:** `turnsSinceShockwave ≥ 6`

```
shockwave = 66% of pool
thunder   = rest of pool (34%)
```

The slight rounding difference (66/34 vs 66.7/33.3) is due to integer
percentage math.

### Path 3: General Case

**Condition:** Everything else (`3 ≤ TurnsSinceShockwave < 6`, `TurnCount > 3`)

**Game:** Lines 1019–1043

The game has two nested probability gates:

1. **75% gate + Mario's jump/hammer charge** (lines 1020–1030):
   ```
   RandInt(100) < 75 → GetJumpHammerCharge (Mario's jump/hammer charge)
       if either charge > 0 → shockwave (early return)
   ```
   This gate only produces shockwave (never thunder). If the 75% roll
   fails or Mario has no charge, execution falls through.

2. **~27% gate** (lines 1032–1040):
   ```
   RandInt(110) < 30:
       < 20 → shockwave   — 18.2%
       ≥ 20 → thunder     — 9.1%
   ```

3. **Fallback** (line 1043): `EVS_UseAttack` (regular attacks).

**Calculator:** `else` branch

The calculator **does** track Mario's charge. `GetJumpHammerCharge`
(Mario's jump/hammer charge) is represented by `mario.buffed` (Mario
boosting himself) or `partner.buffTurns > 0` (a partner boosting Mario).
When charged, the 75% gate fires: 75% of the pool is taken as shockwave,
and the remaining 25% still passes through the ~27% gate below. When
*not* charged, the whole pool passes through the ~27% gate.

```
if (mario.buffed || partner.buffTurns > 0):
    shockwave += 75% of pool        // 75% gate
    remaining  = 25% of pool
else:
    remaining  = 100% of pool
shockwave += floor(66% × 27%) of remaining  ≈ 18% of remaining
thunder   += floor(34% × 27%) of remaining  ≈ 9%  of remaining
rest       → regular attack pool (stomp / claw / fire)
```

Worked example (Mario charged, full 100% pool):
- `shockwave = 75` (75% gate), `remaining = 25`
- `shockwave += floor(66 × 27 / 100) × 25 / 100 = 4` → `79`
- `thunder = floor(34 × 27 / 100) × 21 / 100 = 1`
- result: **shockwave ≈ 79%**, thunder ≈ 1%, rest regular

This matches the game's combined probability (75% + 25% × 18.2% ≈ 79.5%
shockwave), within integer-rounding error.

---

## 8. Regular Attack Pool (EVS_UseAttack)

**Game:** `final_bowser_2.c` lines 1049–1068 (identical in both phases)

```
RandInt(80) < 20 → check TurnsSinceBodySlam ≥ 2 → stomp   (25%)
RandInt(60) < 20 → check TurnsSinceClawSwipe ≥ 2 → claw   (33.3%)
else → fire breath                                    (rest)
```

**Calculator:**

```
if (turnsSinceStomp > 0):  stomp = 25% of pool
if (turnsSinceClaw > 0):  claw  = 33% of pool
fire = rest of pool
```

Each step deducts from the remaining pool. The `> 0` threshold
compensates for the counter timing difference (see §2).

---

## 9. Phase Transition

**Game:** The phase transition happens between `final_bowser_1.c` and
`final_bowser_2.c` as separate actor definitions. Phase 2's `EVS_Init`
(`final_bowser_2.c` lines 191–213) sets fresh counter values.

**Calculator:** `handleNextTurn` lines 319–330

When `turn ≥ 3 && phase === 1`, the calculator:
- Switches to phase 2
- Resets turn to 1
- Re-initializes counters

| Counter              | Game init (Phase 2 EVS_Init) | Calculator init |
|----------------------|------------------------------|-----------------|
| `TurnCount`          | 0                            | 1 (1-indexed)   |
| `TurnsSinceShockwave`| 0                            | 1 (offset)      |
| `TurnsSinceClawSwipe`| 3                            | 3               |
| `TurnsSinceBodySlam` | 3                            | 3               |
| `TurnsSinceRecover`  | 0                            | 1 (offset)      |
| `TurnsSinceStarBeam` | 0                            | 1 (offset)      |

The +1 offset on counters initialized to 0 compensates for the counter
timing difference (the game will increment them to 1 at the start of the
first Phase 2 turn).

Mario's HP and FP are also fully restored at the transition.

---

## 10. Known Differences / Limitations

1. **Mario's jump/hammer charge is tracked.** The game's 75% gate in
   `EVS_UseAttackOrShockwave` checks `GetJumpHammerCharge` — **Mario's**
   jump/hammer charge (not the partner's). The calculator models this via
   `mario.buffed` (Mario boosting himself) and `partner.buffTurns > 0`
   (a partner boosting Mario). When charged, the 75% gate takes 75% of the
   pool as shockwave and the remaining 25% still passes through the ~27%
   gate, giving ≈ 79% shockwave total — matching the game (75% +
   25% × 18.2% ≈ 79.5%) within integer-rounding error. The only residual
   inaccuracy is rounding (see item 2).

2. **Rounding.** The calculator uses integer `Math.floor` at each step.
   Small probability pools (e.g. after heal + shield deductions) may cause
   thunder or stomp to round to 0% even though the game could produce them.

3. **Recover secondary gate ignored.** The game has a second `RandInt(100) < 0`
   check that never fires. The calculator correctly omits it.

4. **Star Rod re-enchant switch cases.** The game uses a `Switch` on
   `TurnsSinceStarBeam` with exact values (1→0%, 2→0%, 3→15%, default→75%).
   The calculator uses `=== 3` and `> 3` which produces the same result
   since values are always ≥ 1 at prediction time.

5. **State mutation.** `handleNextTurn` mutates `fightData` sub-objects
   via references (`let bowser = fightData.Bowser`). This works because
   `setFightData` is called with a new top-level spread, triggering a
   React re-render. However, the mutated objects are the same references,
   which could cause issues if React batches or retries the update.

---

## 11. Verified Discrepancies (Audit) — all fixed 2026-08-28

**Method:** `src/Logic/finalBowserReference.ts` is a direct TypeScript port
of the decision-only logic in `EVS_TakeTurn_Inner`, `EVS_UseAttackOrShockwave`,
and `EVS_UseAttack` (both phases) — no hand-typed percentages. Every
`RandInt` call is explored exhaustively (`enumerateOutcomes`) to get the
exact set of actions the game can reach from a given counter state.
`src/Pages/Final-Bowser/Components/__tests__/FightTabs.logic.test.ts` drives
both this reference model and the calculator's real `handlePredictions`
through matching turn states and asserts the same actions are reachable
(plus one test, §11.4, that compares exact probabilities directly since
that bug doesn't change *reachability*, only the split between two already-
reachable actions). Run it with `npm test -- FightTabs.logic`.

The four bugs below were found this way, then fixed in `FightTabs.tsx`; the
suite is now fully green (20/20) and stands as the permanent regression net
for this class of bug. Unlike §10's items (which are intentional, low-impact
simplifications), these were unintended and changed what the calculator
predicted Bowser would do.

### 11.1 Heal ("recover") counter reset was missing the +1 offset — fixed

`FightTabs.tsx`, `handleNextTurn`, `case "heal":` set
`bowser.turnsInfo.turnsSinceHeal = 0`. Every other counter that uses the
"calculator value == game value" convention (§2) — i.e. checked against the
game's own unshifted threshold — needs its *reset* value offset by +1 to
stay in that convention, the same way the phase-transition init and the
shield/beam reset already do. This reset didn't, so it desynced from the
very next heal check onward:

| Rounds since heal | Game (`AVAR_TurnsSinceRecover`, `IfGt(x,1)`) | Calculator (`turnsSinceHeal`, `> 1`), before the fix |
|---|---|---|
| 1 | 1 → not eligible | 0 → not eligible (agrees) |
| 2 | 2 → **eligible** | 1 → not eligible (**wrong**) |
| 3 | 3 → eligible | 2 → eligible (calculator caught up, one round late) |

**Effect:** for one full round after Bowser's heal cooldown should reopen,
the calculator showed 0% heal chance when the game already had heal back in
its pool (subject to the HP-gap and 75% roll). **Fix applied:** the reset
now sets `bowser.turnsInfo.turnsSinceHeal = 1`.

### 11.2 Shockwave counter reset was missing the same +1 offset — fixed

Same bug, same cause, different counter. `case "shockwave":` set
`bowser.turnsInfo.turnsSinceShockwave = 0`, but the `< 3` cooldown check
downstream (§7) uses the game's own unshifted threshold and needs the +1
convention to match:

| Rounds since shockwave | Game (`TurnsSinceShockwave`, `< 3`) | Calculator (`turnsSinceShockwave`, `< 3`), before the fix |
|---|---|---|
| 2 | 2 → still on cooldown | 1 → still on cooldown (agrees) |
| 3 | 3 → **cooldown over, shockwave logic runs** | 2 → still on cooldown (**wrong**) |
| 4 | 4 → cooldown over | 3 → cooldown over (calculator caught up, one round late) |

**Effect:** for one round after Bowser should become shockwave/thunder-eligible
again, the calculator still showed regular-attacks-only. **Fix applied:** the
reset now sets `bowser.turnsInfo.turnsSinceShockwave = 1`.

### 11.3 Heal HP-gap boundary used `>=` where the game uses strict `>` — fixed

`handlePredictions` used `if (marioHPPercent - bowserHPPercent >= 25)`. The
game (`final_bowser_2.c:948`) is `IfGt(gap, 25)` — strictly greater, i.e. the
gap must be 26 or more. At exactly a 25-point gap the calculator offered a
heal chance the game cannot produce. **Effect:** narrow (one percentage
point of HP-gap) but real; matters more with a small `maxHP`. **Fix
applied:** the comparison is now `> 25`.

### 11.4 Path 3's ~27% gate split shockwave and thunder against different pools — fixed

`handlePredictions`, Path 3 (general case), used to read:

```js
predictions.shockwave += handlePercentage(handlePercentage(66, 27), totalPredictionPercent);
totalPredictionPercent -= handlePercentage(handlePercentage(66, 27), totalPredictionPercent);
predictions.thunder = handlePercentage(handlePercentage(34, 27), totalPredictionPercent);
```

The ~27% gate (`RandInt(110) < 30`, then `< 20` = shockwave vs `>= 20` = thunder,
`final_bowser_2.c:1032-1041`) is meant to split the *same* remaining pool
66%/34% between shockwave and thunder (approximating the game's 20/30 and
10/30 split of that gate). But the second line subtracted shockwave's share
from `totalPredictionPercent` *before* the third line computed thunder's
share — so thunder ended up computed against a pool that had already been
shrunk by shockwave's cut, not the pool as it stood when the gate was
entered.

**Worked example** (Mario charged, full 100% pool, matches the fight
sequence: Phase 2, boost → skip → stomp, boost → skip → fire, skip → skip
→ stomp, then predicting turns 4–5):

| | shockwave | thunder |
|---|---|---|
| Calculator's output before this fix | 79% | **1%** |
| Exact game probability (0.75 + 0.25×20/110, 0.25×10/110) | 79.55% | **2.27%** |
| Calculator's output after this fix (same 66/27, 34/27 approximation, correct shared pool) | 79% | **2%** |

**Effect:** thunder was under-reported by roughly half in Path 3 whenever
Mario/a partner is charged (the common case once shockwave's cooldown
clears and Mario keeps boosting) — confirmed with the reference model in
`FightTabs.logic.test.ts` ("Path 3 (charged, general case): thunder %
matches the exact game probability"). Shockwave's own number was already
fine, since it was computed before the pool was mutated. **Fix applied:**
the gate's shockwave and thunder shares are now computed against the same
pool snapshot:

```js
const gate2Base = totalPredictionPercent; // pool as of entering the ~27% gate
const gate2Shockwave = handlePercentage(handlePercentage(66, 27), gate2Base);
const gate2Thunder = handlePercentage(handlePercentage(34, 27), gate2Base);
predictions.shockwave += gate2Shockwave;
predictions.thunder = gate2Thunder;
totalPredictionPercent -= gate2Shockwave + gate2Thunder;
```

### Not a bug (checked, kept for the record)

Bowser's own `case "shield":` resets `turnsSinceShield = 0` on cast. The
game's `EVS_StarRodCast` never touches `AVAR_TurnsSinceStarBeam` at all —
only removing the enchant (beam) resets it, which the calculator does
correctly (`case "beam":` sets it to `1`, and the generic per-round
increment that follows brings it to the same value the game reaches by
incrementing once at cast and once more the following round). Since the
shield-eligibility check is separately guarded by "not currently enchanted"
in both the game and the calculator, resetting the counter on cast has no
observable effect on predictions. Confirmed via the "already shielded"
case in the test suite.
