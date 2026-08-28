/**
 * finalBowserReference.ts
 *
 * A faithful, mechanical TypeScript port of the *decision* logic in
 * `src/Logic/final_bowser_1.c` and `src/Logic/final_bowser_2.c` — turn
 * counters, gate order, and branch conditions only (no animation, sound,
 * or camera calls). This is the "ground truth" used by the tests in
 * `FightTabs.logic.test.ts` to check the calculator's `handlePredictions`
 * against the actual game scripts, rather than against hand-derived
 * percentages (which is exactly the kind of manual arithmetic that
 * produced the bugs this suite exists to catch).
 *
 * Each `Call(RandInt, N, LVar0)` in the game scripts is represented here as
 * a call to `roll(N)`, a caller-supplied function returning a value in
 * [0, N). `enumerateOutcomes` (below) explores every possible value at
 * every `roll()` call site and tallies the resulting action probabilities
 * exactly — no hand-typed percentages anywhere in this file.
 *
 * Source line references are given so each branch can be checked directly
 * against the decompiled script.
 */

export type RefAction =
    | "recover"
    | "starrod"
    | "shockwave"
    | "thunder"
    | "bodyslam"
    | "clawswipe"
    | "firebreath";

/** Mirrors the AVAR_* actor variables tracked per-Bowser-actor in the game. */
export interface RefCounters {
    /** AVAR_TurnCount, value AFTER this turn's increment (as used by the checks). */
    turnCount: number;
    turnsSinceShockwave: number;
    turnsSinceStarBeam: number;
    turnsSinceClawSwipe: number;
    turnsSinceBodySlam: number;
    turnsSinceRecover: number;
    recoversLeft: number;
    /** ACTOR_EVENT_FLAG_STAR_ROD_ENCHANTED */
    enchanted: boolean;
}

export interface RefContext {
    marioHpPercent: number;
    bowserHpPercent: number;
    /** GetJumpHammerCharge LVar0 */
    jumpCharge: number;
    /** GetJumpHammerCharge LVar1 */
    hammerCharge: number;
}

/** GetActorVar init values from EVS_Init — identical in both phase files. */
export const REF_INIT_COUNTERS: RefCounters = {
    turnCount: 0,
    turnsSinceShockwave: 0,
    turnsSinceStarBeam: 0,
    turnsSinceClawSwipe: 3,
    turnsSinceBodySlam: 3,
    turnsSinceRecover: 0,
    recoversLeft: 3,
    enchanted: false,
};
// Phase 2's EVS_Init additionally enchants Bowser immediately (final_bowser_2.c:255).
export const REF_INIT_COUNTERS_PHASE2: RefCounters = {...REF_INIT_COUNTERS, enchanted: true};

/**
 * EVS_UseAttack (final_bowser_1.c:815-834, identical at final_bowser_2.c:1049-1068).
 */
export function refUseAttack(c: RefCounters, roll: (max: number) => number): RefAction {
    if (roll(80) < 20 && c.turnsSinceBodySlam >= 2) {
        return "bodyslam";
    }
    if (roll(60) < 20 && c.turnsSinceClawSwipe >= 2) {
        return "clawswipe";
    }
    return "firebreath";
}

/**
 * EVS_UseAttackOrShockwave (final_bowser_2.c:1001-1047; only reachable from
 * Phase 2, since Phase 1 only has 2 turns and its shockwave-cooldown check
 * always routes to EVS_UseAttack — see refDecideTurn).
 */
export function refUseAttackOrShockwave(c: RefCounters, ctx: RefContext, roll: (max: number) => number): RefAction {
    // Line 1003-1007: only regular attacks for the first few turns.
    if (c.turnCount <= 3) {
        return refUseAttack(c, roll);
    }
    // Line 1009-1018: forced shockwave/thunder after a long cooldown.
    if (c.turnsSinceShockwave >= 6) {
        return roll(30) < 20 ? "shockwave" : "thunder";
    }
    // Line 1020-1031: 75% gate on Mario's jump/hammer charge.
    if (roll(100) < 75) {
        if (ctx.jumpCharge > 0 || ctx.hammerCharge > 0) {
            return "shockwave";
        }
    }
    // Line 1033-1041: ~27% gate regardless of charge.
    const r = roll(110);
    if (r < 30) {
        return r < 20 ? "shockwave" : "thunder";
    }
    // Line 1043: fallback to a regular attack.
    return refUseAttack(c, roll);
}

/**
 * EVS_TakeTurn_Inner (final_bowser_2.c:935-998; final_bowser_1.c:675-764 is
 * identical apart from the extra TurnCount===2 early return, handled by the
 * caller before invoking this — see refDecideTurn). Counters must already
 * reflect this turn's increments (lines 936-941 / 677-681) before calling.
 */
export function refTakeTurnInner(c: RefCounters, ctx: RefContext, roll: (max: number) => number): RefAction {
    // Lines 942-968 (708-734 in phase 1): heal check.
    if (ctx.marioHpPercent - ctx.bowserHpPercent > 25) {
        if (c.recoversLeft !== 0) {
            if (roll(100) < 75) {
                if (c.turnsSinceRecover > 1) {
                    return "recover";
                }
                // Lines 725-730: `RandInt(100) < 0` can never be true — dead
                // code in the original script. Correctly omitted (see
                // Logic.md §10.3); no roll() call needed since it can't
                // branch.
            }
        }
    }
    // Lines 969-989 (735-756 in phase 1): shield / Star Rod re-enchant.
    if (c.turnCount > 1 && !c.enchanted) {
        let chance: number;
        switch (c.turnsSinceStarBeam) {
            case 1:
                chance = 0;
                break;
            case 2:
                chance = 0;
                break;
            case 3:
                chance = 15;
                break;
            default:
                chance = 75;
        }
        if (roll(100) < chance) {
            return "starrod";
        }
    }
    // Lines 991-994 (757-761 in phase 1): shockwave cooldown.
    if (c.turnsSinceShockwave < 3) {
        return refUseAttack(c, roll);
    }
    // Line 996 (762 in phase 1): general case — only reachable in Phase 2 in
    // practice, since Phase 1 never reaches TurnCount > 2.
    return refUseAttackOrShockwave(c, ctx, roll);
}

/**
 * Full per-turn decision, folding in the Phase-1-only scripted turn 2
 * (final_bowser_1.c:683-707: `IfEq(TurnCount, 2)` forces the Star Rod cast
 * before any of the checks in EVS_TakeTurn_Inner run).
 *
 * `counters` must already reflect this turn's increments.
 */
export function refDecideTurn(
    phase: 1 | 2,
    c: RefCounters,
    ctx: RefContext,
    roll: (max: number) => number
): RefAction {
    if (phase === 1 && c.turnCount === 2) {
        return "starrod";
    }
    return refTakeTurnInner(c, ctx, roll);
}

// ── Exhaustive probability enumeration ──────────────────────────────────

/**
 * Runs `fn` against every possible combination of values at every `roll()`
 * call site it makes, and returns the exact probability of each distinct
 * result. This replaces hand-typed percentages: the probabilities emerge
 * mechanically from the branch structure of the ported game code above.
 *
 * Implementation: `fn` is replayed from the start once per newly-discovered
 * branch point, feeding it a fixed prefix of previously-chosen roll values
 * so it retraces the same path up to that point, then is allowed to pick
 * the next roll value it needs. This is a small DFS over the game's own
 * control flow, so unreachable branches are automatically never explored
 * (e.g. once a low-probability path is skipped, none of its downstream
 * roll() calls are visited at all — no different from the real game).
 */
export function enumerateOutcomes<T>(fn: (roll: (max: number) => number) => T): Map<T, number> {
    const results = new Map<T, number>();

    function record(result: T, weight: number) {
        results.set(result, (results.get(result) ?? 0) + weight);
    }

    function recurse(prefix: number[], weight: number) {
        let idx = 0;
        let branch: { max: number } | null = null;
        const rollFn = (max: number): number => {
            if (idx < prefix.length) {
                return prefix[idx++];
            }
            branch = {max};
            // Signal via exception so `fn` doesn't need to be written in a
            // generator/CPS style — it can call roll() like the game's
            // Call(RandInt, ...) does, inline and imperatively.
            throw BRANCH_SIGNAL;
        };
        try {
            const result = fn(rollFn);
            record(result, weight);
        } catch (e) {
            if (e !== BRANCH_SIGNAL || branch === null) {
                throw e;
            }
            const {max} = branch;
            for (let v = 0; v < max; v++) {
                recurse([...prefix, v], weight / max);
            }
        }
    }

    recurse([], 1);
    return results;
}

const BRANCH_SIGNAL = Symbol("branch");

/** Set of actions with non-zero probability, per `enumerateOutcomes`. */
export function reachableActions<T>(outcomes: Map<T, number>): Set<T> {
    const result = new Set<T>();
    outcomes.forEach((p, action) => {
        if (p > 0) result.add(action);
    });
    return result;
}
