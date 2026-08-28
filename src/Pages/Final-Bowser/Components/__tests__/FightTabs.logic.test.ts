/**
 * FightTabs.logic.test.ts
 *
 * Verifies the calculator's `handlePredictions` (src/Pages/Final-Bowser/
 * Components/FightTabs.tsx) against the reference model ported directly
 * from the decompiled game scripts (src/Logic/__tests__/finalBowserReference.ts).
 *
 * Strategy: for a given fight state, compute from the reference model which
 * actions are *reachable at all* (non-zero probability) via exhaustive
 * enumeration of every RNG branch in the ported scripts, and compare that
 * against which of the calculator's `predictions.*` fields are non-zero.
 * This targets exactly the class of bug this audit is about — a counter
 * gate opening/closing on the wrong turn — without getting entangled in
 * the calculator's separately-documented integer-rounding limitations
 * (Logic.md §10.2), which are not what's being audited here.
 *
 * A FAILING test here is a *finding*, not a bug in the test — see the
 * writeup in Logic.md for what to do about each one. Do not "fix" a
 * failure by changing the test's expectation without first confirming
 * against the .c source that the reference model, not the calculator, is
 * wrong.
 *
 * The four bugs originally found by this suite (Logic.md §11.1–11.4) have
 * since been fixed in FightTabs.tsx; the tests below now assert the
 * corrected (matching) behavior and serve as the permanent regression net.
 */
import {handlePredictions} from "../FightTabs";
import BowserI from "../../../../Types/bowser.types";
import MarioI from "../../../../Types/mario.type";
import PartnerI from "../../../../Types/partner.types";
import {
    enumerateOutcomes,
    reachableActions,
    RefAction,
    RefContext,
    RefCounters,
    refDecideTurn,
    REF_INIT_COUNTERS_PHASE2,
} from "../../../../Logic/finalBowserReference";

// ── Fixtures ────────────────────────────────────────────────────────────

function makeMario(overrides: Partial<MarioI> = {}): MarioI {
    return {
        maxHP: 99, hp: 99, maxFP: 99, fp: 99,
        boots: "boots", hammer: "hammer", items: null, badges: null,
        buffed: false, action: "", damage: 0,
        ...overrides,
    };
}

function makeBowser(overrides: Partial<BowserI> = {}): BowserI {
    return {
        maxHP: 99, hp: 99, heals: 0, shield: false, action: "",
        turnsInfo: {
            turnsSinceShield: 0, turnsSinceClaw: 0, turnsSinceHeal: 0,
            turnsSinceStomp: 0, turnsSinceShockwave: 0,
        },
        actionChances: {shield: 0, fire: 0, claw: 0, heal: 0, buttstomp: 0, thunder: 0, shockwave: 0},
        ...overrides,
        turnsInfo: {
            turnsSinceShield: 0, turnsSinceClaw: 0, turnsSinceHeal: 0,
            turnsSinceStomp: 0, turnsSinceShockwave: 0,
            ...overrides.turnsInfo,
        },
    };
}

function makePartner(overrides: Partial<PartnerI> = {}): PartnerI {
    return {action: "", damage: 0, buffTurns: 0, ...overrides};
}

/** Calculator prediction field -> reference model action name. */
const FIELD_TO_ACTION: Record<string, RefAction> = {
    heal: "recover",
    shield: "starrod",
    shockwave: "shockwave",
    thunder: "thunder",
    buttstomp: "bodyslam",
    claw: "clawswipe",
    fire: "firebreath",
};

/** Which calculator prediction fields are non-zero. */
function calcReachable(predictions: Record<string, number>): Set<RefAction> {
    const s = new Set<RefAction>();
    for (const [field, action] of Object.entries(FIELD_TO_ACTION)) {
        if (predictions[field] > 0) s.add(action);
    }
    return s;
}

function refReachable(phase: 1 | 2, counters: RefCounters, ctx: RefContext): Set<RefAction> {
    const outcomes = enumerateOutcomes((roll) => refDecideTurn(phase, counters, ctx, roll));
    return reachableActions(outcomes);
}

const neutralCtx: RefContext = {marioHpPercent: 100, bowserHpPercent: 100, jumpCharge: 0, hammerCharge: 0};

function expectSameReachability(actual: Set<RefAction>, expected: Set<RefAction>, label: string) {
    const sortedActual = Array.from(actual).sort();
    const sortedExpected = Array.from(expected).sort();
    expect({label, reachable: sortedActual}).toEqual({label, reachable: sortedExpected});
}

// ── Phase 1 ─────────────────────────────────────────────────────────────

describe("Phase 1", () => {
    test("turn 1: regular attack pool only, matches EVS_UseAttack", () => {
        const bowser = makeBowser({turnsInfo: {turnsSinceShield: 0, turnsSinceClaw: 3, turnsSinceHeal: 0, turnsSinceStomp: 3, turnsSinceShockwave: 0}});
        const predictions = handlePredictions(1, 1, makeMario(), bowser, makePartner());
        const calc = calcReachable(predictions as any);

        const counters: RefCounters = {...REF_INIT_COUNTERS_PHASE2, turnCount: 1, turnsSinceClawSwipe: 4, turnsSinceBodySlam: 4, turnsSinceShockwave: 1, turnsSinceStarBeam: 1, turnsSinceRecover: 1, enchanted: false};
        const ref = refReachable(1, counters, neutralCtx);

        expectSameReachability(calc, ref, "phase1 turn1");
    });

    test("turn 2: shield guaranteed", () => {
        const predictions = handlePredictions(2, 1, makeMario(), makeBowser(), makePartner());
        expect(predictions.shield).toBe(100);
        expect(predictions.buttstomp).toBe(0);
        expect(predictions.claw).toBe(0);
        expect(predictions.fire).toBe(0);
    });
});

// ── Phase 2: heal (recover) ────────────────────────────────────────────

describe("Phase 2 heal eligibility", () => {
    // Big enough HP gap that the `IfGt(gap, 25)` threshold (§11.3) passes
    // with margin, isolating the counter-timing question.
    const bigGapMario = makeMario({hp: 99, maxHP: 99});
    const bigGapBowser = (turnsSinceHeal: number, heals = 0) => makeBowser({
        hp: 10, maxHP: 99, heals,
        turnsInfo: {turnsSinceShield: 0, turnsSinceClaw: 3, turnsSinceHeal, turnsSinceStomp: 3, turnsSinceShockwave: 1},
    });
    const refCounters = (turnsSinceRecover: number, recoversLeft = 3): RefCounters => ({
        ...REF_INIT_COUNTERS_PHASE2, turnCount: 5, turnsSinceRecover, recoversLeft,
        turnsSinceClawSwipe: 4, turnsSinceBodySlam: 4, turnsSinceShockwave: 1, turnsSinceStarBeam: 4,
    });
    const bigGapCtx: RefContext = {marioHpPercent: 100, bowserHpPercent: 10, jumpCharge: 0, hammerCharge: 0};

    // With the +1-offset reset fix (Logic.md §11.1), the calculator's
    // turnsSinceHeal and the game's AVAR_TurnsSinceRecover are now numerically
    // equal at prediction time — both parametrized here by `m`, the number
    // of rounds since (and including) the heal round.
    test("1 round after a heal: not eligible (both agree)", () => {
        const predictions = handlePredictions(2, 2, bigGapMario, bigGapBowser(1), makePartner());
        const calc = predictions.heal > 0;
        const ref = refReachable(2, refCounters(1), bigGapCtx).has("recover");
        expect(calc).toBe(false);
        expect(ref).toBe(false);
        expect(calc).toBe(ref);
    });

    test("2 rounds after a heal: eligibility reopens here", () => {
        const predictions = handlePredictions(3, 2, bigGapMario, bigGapBowser(2), makePartner());
        const calc = predictions.heal > 0;
        const ref = refReachable(2, refCounters(2), bigGapCtx).has("recover");
        expect(ref).toBe(true); // game: TurnsSinceRecover=2, IfGt(2,1) true
        expect(calc).toBe(ref);
    });

    test("3 rounds after a heal: still eligible", () => {
        const predictions = handlePredictions(4, 2, bigGapMario, bigGapBowser(3), makePartner());
        const calc = predictions.heal > 0;
        expect(calc).toBe(true);
    });

    test("HP gap exactly 25: not eligible, matching the game's strict IfGt", () => {
        // Mario 100%, Bowser 75% -> gap is exactly 25 (round maxHP values so
        // the percentages land on whole numbers, not just close to them).
        const mario = makeMario({hp: 100, maxHP: 100});
        const bowser = makeBowser({
            hp: 75, maxHP: 100, heals: 0,
            turnsInfo: {turnsSinceShield: 0, turnsSinceClaw: 3, turnsSinceHeal: 4, turnsSinceStomp: 3, turnsSinceShockwave: 1},
        });
        const predictions = handlePredictions(6, 2, mario, bowser, makePartner());
        const calc = predictions.heal > 0;

        const ctx: RefContext = {marioHpPercent: 100, bowserHpPercent: (bowser.hp / bowser.maxHP) * 100, jumpCharge: 0, hammerCharge: 0};
        const counters = refCounters(4);
        const ref = refReachable(2, counters, ctx).has("recover");

        expect(ref).toBe(false); // game: IfGt(25, 25) is false, gap must be > 25
        expect(calc).toBe(ref); // fixed: calculator now uses a strict `>` too
    });

    test("heals === 3: never eligible regardless of counters", () => {
        const predictions = handlePredictions(10, 2, bigGapMario, bigGapBowser(5, 3), makePartner());
        expect(predictions.heal).toBe(0);
        const ref = refReachable(2, refCounters(5, 0), bigGapCtx).has("recover");
        expect(ref).toBe(false);
    });
});

// ── Phase 2: shield / Star Rod re-enchant ──────────────────────────────

describe("Phase 2 shield eligibility ramp", () => {
    const mario = makeMario();
    const bowserWith = (turnsSinceShield: number, shield = false) => makeBowser({
        shield,
        turnsInfo: {turnsSinceShield, turnsSinceClaw: 3, turnsSinceHeal: 1, turnsSinceStomp: 3, turnsSinceShockwave: 1},
    });
    const refCounters = (turnsSinceStarBeam: number, turnCount: number): RefCounters => ({
        ...REF_INIT_COUNTERS_PHASE2, turnCount, turnsSinceStarBeam, enchanted: false,
        turnsSinceClawSwipe: 4, turnsSinceBodySlam: 4, turnsSinceShockwave: 2, turnsSinceRecover: 4,
    });

    test.each([
        [1, false], // switch case 1 -> 0%
        [2, false], // switch case 2 -> 0%
        [3, true],  // switch case 3 -> 15%
        [4, true],  // default -> 75%
        [5, true],
    ])("turnsSinceShield=%d -> shield reachable=%s (matches game switch on TurnsSinceStarBeam)", (turnsSinceShield, expected) => {
        const predictions = handlePredictions(5, 2, mario, bowserWith(turnsSinceShield), makePartner());
        const calc = predictions.shield > 0;
        const ref = refReachable(2, refCounters(turnsSinceShield, 5), neutralCtx).has("starrod");
        expect(ref).toBe(expected);
        expect(calc).toBe(ref);
    });

    test("already shielded: never re-triggers regardless of counter", () => {
        const predictions = handlePredictions(8, 2, mario, bowserWith(6, true), makePartner());
        expect(predictions.shield).toBe(0);
        const counters: RefCounters = {...refCounters(6, 8), enchanted: true};
        expect(refReachable(2, counters, neutralCtx).has("starrod")).toBe(false);
    });
});

// ── Phase 2: shockwave / thunder cooldown ──────────────────────────────

describe("Phase 2 shockwave cooldown", () => {
    const mario = makeMario();
    const bowserWith = (turnsSinceShockwave: number) => makeBowser({
        turnsInfo: {turnsSinceShield: 5, turnsSinceClaw: 5, turnsSinceHeal: 5, turnsSinceStomp: 5, turnsSinceShockwave},
    });
    const refCounters = (turnsSinceShockwave: number, turnCount = 10): RefCounters => ({
        ...REF_INIT_COUNTERS_PHASE2, turnCount, turnsSinceShockwave, enchanted: true,
        turnsSinceClawSwipe: 6, turnsSinceBodySlam: 6, turnsSinceStarBeam: 6, turnsSinceRecover: 6,
    });

    // Same +1-offset parametrization as the heal tests above (Logic.md §11.2).
    test("1 round after a shockwave: cooldown active (both agree)", () => {
        const predictions = handlePredictions(11, 2, mario, bowserWith(1), makePartner());
        const calc = predictions.shockwave > 0 || predictions.thunder > 0;
        const ref = refReachable(2, refCounters(1), neutralCtx);
        const refHasWave = ref.has("shockwave") || ref.has("thunder");
        expect(refHasWave).toBe(false); // game: TurnsSinceShockwave=1 < 3, regular attacks only
        expect(calc).toBe(refHasWave);
    });

    test("3 rounds after a shockwave: cooldown exits here", () => {
        const predictions = handlePredictions(14, 2, mario, bowserWith(3), makePartner());
        const calc = predictions.shockwave > 0 || predictions.thunder > 0;
        const ref = refReachable(2, refCounters(3), neutralCtx);
        const refHasWave = ref.has("shockwave") || ref.has("thunder");
        expect(refHasWave).toBe(true); // game: TurnsSinceShockwave=3, not < 3 -> shockwave logic
        expect(calc).toBe(refHasWave);
    });

    test("4 rounds after a shockwave: still eligible", () => {
        const predictions = handlePredictions(15, 2, mario, bowserWith(4), makePartner());
        const calc = predictions.shockwave > 0 || predictions.thunder > 0;
        expect(calc).toBe(true);
    });

    test("Path 3 (charged, general case): thunder % matches the exact game probability", () => {
        // Mario charged, turn > 3, 3 <= turnsSinceShockwave < 6, no heal/shield
        // deduction ahead of it (full 100% pool, shield already enchanted so
        // its check is skipped) -- isolates the ~27% gate's internal math.
        const mario = makeMario({buffed: true});
        const bowser = makeBowser({
            shield: true, // already enchanted -> shield check skipped, full pool available
            turnsInfo: {turnsSinceShield: 4, turnsSinceClaw: 6, turnsSinceHeal: 4, turnsSinceStomp: 0, turnsSinceShockwave: 4},
        });
        const predictions = handlePredictions(4, 2, mario, bowser, makePartner());

        const counters: RefCounters = {
            ...REF_INIT_COUNTERS_PHASE2, turnCount: 4, turnsSinceShockwave: 4,
            turnsSinceClawSwipe: 6, turnsSinceBodySlam: 0, turnsSinceStarBeam: 4, turnsSinceRecover: 4,
            enchanted: true,
        };
        const ctx: RefContext = {marioHpPercent: 100, bowserHpPercent: 100, jumpCharge: 1, hammerCharge: 0};
        const outcomes = enumerateOutcomes((roll) => refDecideTurn(2, counters, ctx, roll));
        const exactThunderPct = (outcomes.get("thunder") ?? 0) * 100; // ~2.27%, exact combinatorics

        // Fixed: both shares of the ~27% gate are now computed against the
        // same pre-gate pool (25), so thunder = floor(floor(34*27/100)*25/100) = 2,
        // matching the exact game probability once rounded (was 1 before the fix).
        expect(Math.round(exactThunderPct)).toBe(2);
        expect(predictions.thunder).toBe(2);
    });

    test("Path 3: a partner's boost alone does not trigger the 75% charge gate", () => {
        // Verified against src/common/GetJumpHammerCharge.inc.c (upstream
        // pmret/papermario): it only reads gBattleStatus.jumpCharge/
        // hammerCharge, which are set exclusively by Mario's OWN Charge
        // move. A partner's boost (e.g. Watt's Turbo Charge) sets a
        // completely separate field that dmg_player.c never combines with
        // jumpCharge/hammerCharge (Logic.md §11.5). So an uncharged Mario
        // with a boosted partner should behave identically to a fully
        // uncharged pair -- no 75% shockwave-gate bonus either way.
        const uncharged = makeMario({buffed: false});
        const bowser = makeBowser({
            shield: true,
            turnsInfo: {turnsSinceShield: 4, turnsSinceClaw: 6, turnsSinceHeal: 4, turnsSinceStomp: 0, turnsSinceShockwave: 4},
        });
        const withoutPartnerBoost = handlePredictions(4, 2, uncharged, bowser, makePartner({buffTurns: 0}));
        const withPartnerBoost = handlePredictions(4, 2, uncharged, bowser, makePartner({buffTurns: 5}));
        expect(withPartnerBoost).toEqual(withoutPartnerBoost);
        expect(withPartnerBoost.shockwave).toBeLessThan(75); // no 75% gate bonus applied
    });

    test("turnsSinceShockwave >= 6: forced shockwave/thunder, no regular attacks", () => {
        const predictions = handlePredictions(20, 2, mario, bowserWith(6), makePartner());
        expect(predictions.buttstomp).toBe(0);
        expect(predictions.claw).toBe(0);
        expect(predictions.fire).toBe(0);
        expect(predictions.shockwave).toBeGreaterThan(0);
        expect(predictions.thunder).toBeGreaterThan(0);

        const ref = refReachable(2, refCounters(6), neutralCtx);
        expect(ref).toEqual(new Set(["shockwave", "thunder"]));
    });
});

// ── Phase 2: regular attack pool (stomp/claw cooldowns) ────────────────

describe("Phase 2 regular attack pool", () => {
    const mario = makeMario();
    const bowserWith = (turnsSinceStomp: number, turnsSinceClaw: number) => makeBowser({
        turnsInfo: {turnsSinceShield: 0, turnsSinceClaw, turnsSinceHeal: 0, turnsSinceStomp, turnsSinceShockwave: 0},
    });

    test("both on cooldown: fire breath only", () => {
        const predictions = handlePredictions(2, 2, mario, bowserWith(0, 0), makePartner());
        expect(predictions.buttstomp).toBe(0);
        expect(predictions.claw).toBe(0);
        expect(predictions.fire).toBe(100);

        const counters: RefCounters = {...REF_INIT_COUNTERS_PHASE2, turnCount: 2, turnsSinceBodySlam: 1, turnsSinceClawSwipe: 1, turnsSinceShockwave: 1};
        const ref = refReachable(2, counters, neutralCtx);
        expect(ref).toEqual(new Set(["firebreath"]));
    });

    test("both off cooldown: stomp/claw/fire all reachable", () => {
        const predictions = handlePredictions(2, 2, mario, bowserWith(3, 3), makePartner());
        expect(predictions.buttstomp).toBeGreaterThan(0);
        expect(predictions.claw).toBeGreaterThan(0);
        expect(predictions.fire).toBeGreaterThan(0);

        const counters: RefCounters = {...REF_INIT_COUNTERS_PHASE2, turnCount: 2, turnsSinceBodySlam: 4, turnsSinceClawSwipe: 4, turnsSinceShockwave: 1};
        const ref = refReachable(2, counters, neutralCtx);
        expect(ref).toEqual(new Set(["bodyslam", "clawswipe", "firebreath"]));
    });
});
