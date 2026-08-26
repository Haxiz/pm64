# Bowser Fight Calculator — Logic Reference

This document describes how the calculator in `FightTabs.tsx` maps to the
original game scripts in `src/Logic/final_bowser_1.c` (Phase 1) and
`src/Logic/final_bowser_2.c` (Phase 2).

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

1. **75% gate + partner charges** (lines 1020–1030):
   ```
   RandInt(100) < 75 → check partner jump/hammer charges
       if any charge > 0 → shockwave (early return)
   ```
   This gate only produces shockwave (never thunder). If the 75% roll
   fails or the partner has no charges, execution falls through.

2. **~27% gate** (lines 1032–1040):
   ```
   RandInt(110) < 30:
       < 20 → shockwave   — 18.2%
       ≥ 20 → thunder     — 9.1%
   ```

3. **Fallback** (line 1043): `EVS_UseAttack` (regular attacks).

**Calculator:** `else` branch

The calculator does not track partner charges, so the 75% gate cannot be
accurately modeled. Instead, the else branch approximates the combined
effect:

```
shockwave = floor(66% × 27%) of pool  ≈ 18%
thunder   = floor(34% × 27%) of pool  ≈ 9%
remaining → regular attack pool (stomp / claw / fire)
```

This produces thunder probabilities that were previously missing when the
calculator incorrectly routed this path through a `mario.buffed` check.

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

1. **Partner charges not tracked.** The game's75% gate in `EVS_UseAttackOrShockwave`
   checks `GetJumpHammerCharge` (partner's jump/hammer star power charges).
   The calculator cannot model this and folds it into the general ~27%
   shockwave/thunder path.

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
