import pageStyles from "../../../Styles/page.styles";
import {useContext, useEffect, useRef, useState} from "react";
import {FightContext} from "../FinalBowser";
import {Box, Image, Tabs} from "@mantine/core";
import PhaseTwo from "./PhaseTwo";
import starBeam from "../../../Assets/Icons/star-beam.png";
import peachBeam from "../../../Assets/Icons/peach-beam.png";
import errorNotification from "../../../Services/Utils/Notifications/error.util";
import warningNotification from "../../../Services/Utils/Notifications/warning.util";
import PhaseOne from "./PhaseOne";
import BowserActionsI from "../../../Types/bowserActions.types";
import successNotification from "../../../Services/Utils/Notifications/success.util";
import MarioI from "../../../Types/mario.type";
import BowserI from "../../../Types/bowser.types";
import PartnerI from "../../../Types/partner.types";

/** Returns floor(partialValue * totalValue / 100). */
export function handlePercentage(partialValue: number, totalValue: number) {
    return Math.floor((partialValue * totalValue) / 100);
}

/**
 * Calculates the probability distribution for Bowser's next action.
 *
 * Phase 1 is fully scripted (turn 1 = attack, turn 2 = shield).
 * Phase 2 mirrors EVS_TakeTurn_Inner in final_bowser_1.c / final_bowser_2.c.
 *
 * NOTE: Counter checks use > 0 instead of the game's >= 2 because the
 * calculator increments counters at the END of the previous turn, while
 * the game increments at the START of each turn (before checks). This
 * means the calculator's counter values are always one less than the
 * game's values at the point of the check. See Logic.md § Counter
 * Timing for details.
 *
 * Extracted to module scope (out of the FightTabs component) so it can be
 * unit-tested directly against the reference model in
 * `src/Logic/__tests__/finalBowserReference.ts` — see
 * `FightTabs.logic.test.ts`. Pure function, no behavior change from the
 * original in-component version.
 */
export function handlePredictions(turn: number, phase: number, mario: MarioI, bowser: BowserI, partner: PartnerI) {
    let totalPredictionPercent = 100;
    let predictions: BowserActionsI = {
        shield: 0,
        fire: 0,
        claw: 0,
        buttstomp: 0,
        heal: 0,
        thunder: 0,
        shockwave: 0,
    }
    if (phase === 1) {
        if (turn === 1) {
            //Selecting normal move
            //Stomp has 25% chance of being selected
            predictions.buttstomp = handlePercentage(25, totalPredictionPercent);
            totalPredictionPercent -= predictions.buttstomp;
            //Claw has a 33% chance of being selected
            predictions.claw = handlePercentage(33, totalPredictionPercent);
            totalPredictionPercent -= predictions.claw;
            //Fire takes the rest
            predictions.fire = totalPredictionPercent;
        } else if (turn === 2) {
            //Shield is guaranteed in this turn, moving the fight along to phase two
            predictions.shield = 100;
            predictions.buttstomp = 0;
            predictions.claw = 0;
            predictions.fire = 0;
        }
    } else {
        // ── Phase 2: heal check ────────────────────────────────────
        // Game: EVS_TakeTurn_Inner lines 948–968 (final_bowser_2.c)
        // Condition: Mario HP% − Bowser HP% > 25 AND TurnsSinceRecover > 1
        //            AND RecoversLeft ≠ 0 AND RandInt(100) < 75
        // Calculator: maps TurnsSinceRecover → turnsSinceHeal (> 1)
        let marioHPPercent = mario.hp / mario.maxHP * 100;
        let bowserHPPercent = bowser.hp / bowser.maxHP * 100;
        if (marioHPPercent - bowserHPPercent > 25) {
            if (bowser.heals < 3 && bowser.turnsInfo.turnsSinceHeal > 1) {
                predictions.heal = handlePercentage(75, totalPredictionPercent);
                totalPredictionPercent -= predictions.heal;
            }
        }
        // ── Phase 2: shield check ──────────────────────────────────
        // Game: EVS_TakeTurn_Inner lines 969–989 (final_bowser_2.c)
        // Condition: TurnCount > 1 AND not enchanted AND TurnsSinceStarBeam
        //            determines the re-enchant chance (0%/15%/75%).
        // Calculator: maps TurnsSinceStarBeam → turnsSinceShield (> 1).
        // The `!bowser.shield` guard ensures Bowser won't re-shield when
        // already enchanted (matches the game's ACTOR_EVENT_FLAG check).
        if ((bowser.turnsInfo.turnsSinceShield > 1) && !bowser.shield) {
            if (bowser.turnsInfo.turnsSinceShield === 3) {
                predictions.shield = handlePercentage(15, totalPredictionPercent);
                totalPredictionPercent -= predictions.shield;
            } else if (bowser.turnsInfo.turnsSinceShield > 3) {
                predictions.shield = handlePercentage(75, totalPredictionPercent);
                totalPredictionPercent -= predictions.shield;
            }
        }
        // ── Phase 2: attack selection (mutually exclusive paths) ───
        // Game: EVS_TakeTurn_Inner lines 991–997 → EVS_UseAttackOrShockwave
        //       (final_bowser_2.c lines 1001–1047)
        //
        // Path 1: TurnsSinceShockwave < 3 OR TurnCount ≤ 3
        //         → EVS_UseAttack (regular attacks only, no shockwave)
        //
        // Path 2: TurnsSinceShockwave ≥ 6
        //         → Forced shockwave/thunder (RandInt(30): 20/30 shockwave,
        //           10/30 thunder)
        //
        // Path 3: General case (3 ≤ TurnsSinceShockwave < 6, TurnCount > 3)
        //         → 75% gate: check GetJumpHammerCharge (Mario's jump/hammer
        //           charge) → shockwave if any charge exists. The calculator
        //           tracks this via `mario.buffed` (Mario boosting himself)
        //           or `partner.buffTurns > 0` (a partner boosting Mario).
        //           If the gate fires, shockwave is taken; otherwise it falls
        //           through.
        //         → ~27% gate: RandInt(110) < 30 → shockwave (20/30) or
        //           thunder (10/30). This applies to the REMAINING pool after
        //           the 75% gate (i.e. the 25% the gate did not consume).
        //         → Fallback: EVS_UseAttack (regular attacks).
        if (bowser.turnsInfo.turnsSinceShockwave < 3 || turn <= 3) {
            // Regular attacks only (early turns or post-shockwave cooldown)
            if (totalPredictionPercent > 0) {
                if (bowser.turnsInfo.turnsSinceStomp > 0) {
                    predictions.buttstomp = handlePercentage(25, totalPredictionPercent);
                    totalPredictionPercent -= predictions.buttstomp;
                }
                if (bowser.turnsInfo.turnsSinceClaw > 0) {
                    predictions.claw = handlePercentage(33, totalPredictionPercent);
                    totalPredictionPercent -= predictions.claw;
                }
                predictions.fire = totalPredictionPercent;
                totalPredictionPercent = 0;
            }
        } else if (bowser.turnsInfo.turnsSinceShockwave >= 6) {
            // Shockwave forced after long cooldown
            if (totalPredictionPercent > 0) {
                predictions.shockwave = handlePercentage(66, totalPredictionPercent);
                totalPredictionPercent -= predictions.shockwave;
                predictions.thunder = totalPredictionPercent;
                totalPredictionPercent = 0;
            }
        } else {
            // Path 3 general case.
            // Game: 75% gate (final_bowser_2.c:1019-1030) checks
            // GetJumpHammerCharge (Mario's jump/hammer charge). If Mario is
            // charged — by boosting himself or via a partner boost — the gate
            // fires 75% of the time → shockwave. The remaining 25% still
            // passes through the ~27% gate below.
            if (totalPredictionPercent > 0) {
                const marioCharged = mario.buffed || partner.buffTurns > 0;
                if (marioCharged) {
                    predictions.shockwave = handlePercentage(75, totalPredictionPercent);
                    totalPredictionPercent -= predictions.shockwave;
                }
                // ~27% gate (final_bowser_2.c:1032-1043) on the remaining pool.
                // Both shares are computed against the SAME pre-gate pool
                // snapshot (gate2Base) — computing thunder against a pool
                // already shrunk by shockwave's share was a bug (see
                // Logic.md §11.4).
                const gate2Base = totalPredictionPercent;
                const gate2Shockwave = handlePercentage(handlePercentage(66, 27), gate2Base);
                const gate2Thunder = handlePercentage(handlePercentage(34, 27), gate2Base);
                predictions.shockwave += gate2Shockwave;
                predictions.thunder = gate2Thunder;
                totalPredictionPercent -= gate2Shockwave + gate2Thunder;
                // Remaining pool goes to normal moves
                if (bowser.turnsInfo.turnsSinceStomp > 0) {
                    predictions.buttstomp = handlePercentage(25, totalPredictionPercent);
                    totalPredictionPercent -= predictions.buttstomp;
                }
                if (bowser.turnsInfo.turnsSinceClaw > 0) {
                    predictions.claw = handlePercentage(33, totalPredictionPercent);
                    totalPredictionPercent -= predictions.claw;
                }
                predictions.fire = totalPredictionPercent;
                totalPredictionPercent = 0;
            }
        }
    }
    return predictions;
}

/**
 * FightTabs — Core Bowser fight calculator.
 *
 * Mirrors the AI logic from `src/Logic/final_bowser_1.c` (Phase 1) and
 * `src/Logic/final_bowser_2.c` (Phase 2) to predict Bowser's next move
 * and track the fight state turn-by-turn.
 *
 * See Logic.md for a detailed comparison between the calculator and the
 * original game scripts.
 */
export default function FightTabs() {
    const {classes} = pageStyles();
    const {fightData, setFightData} = useContext(FightContext);
    const [activeTab, setActiveTab] = useState<string | null>("first");

    // ── Reset ──────────────────────────────────────────────────────────
    /** Resets all fight state back to initial values. */
    function resetFight() {
        setFightData({
            Mario: {
                ...fightData.Mario,
                buffed: false,
                action: "",
                damage: 0,
            },
            Bowser: {
                maxHP: 99,
                hp: 99,
                heals: 0,
                shield: false,
                turnsInfo: {
                    turnsSinceShield: 0,
                    turnsSinceClaw: 0,
                    turnsSinceHeal: 0,
                    turnsSinceStomp: 0,
                    turnsSinceShockwave: 0,
                },
                action: "",
                actionChances: {
                    shield: 0,
                    fire: 0,
                    claw: 0,
                    heal: 0,
                    buttstomp: 0,
                    thunder: 0,
                    shockwave: 0,
                }
            },
            Partner: {
                action: "",
                damage: 0,
                buffTurns: 0,
            },
            turn: 0,
            first: "Mario",
            phase: 1,
        });
        setActiveTab("first");
    }

    // ── Validation ─────────────────────────────────────────────────────
    /**
     * Validates the current turn inputs before advancing.
     * Returns true if any errors are found (caller should abort the turn).
     */
    function handleErrors() {
        let error = false;
        if (fightData.Bowser.action === "") {
            errorNotification("Hold on", "You must select an action for Bowser!");
            error = true;
        }
        if (fightData.Mario.action === "") {
            errorNotification("Hold on", "You must select an action for Mario!");
            error = true;
        }
        if (fightData.Partner.action === "") {
            errorNotification("Hold on", "You must select an action for your partner!");
            error = true;
        }
        if (fightData.Mario.action === "attack" && fightData.Mario.damage === 0) {
            warningNotification("Careful", "You haven't selected a damage value for Mario! Change it or try the 'Skip' button instead.");
            error = true;
        }
        if (fightData.Partner.action === "attack" && fightData.Partner.damage === 0) {
            warningNotification("Careful", "You haven't selected a damage value for your partner! Change it or try the 'Skip' button instead.");
            error = true;
        }
        if (fightData.Bowser.action === "heal" && fightData.Bowser.heals === 3) {
            errorNotification("Hold on", "Bowser has already used his three heals!");
            error = true;
        }
        return error;
    }

    // ── Turn advancement ───────────────────────────────────────────────
    /**
     * Processes the current turn and advances to the next one.
     *
     * Turn 0 → 1: Initial prediction only (no state changes).
     * Turn 1+: Validates inputs, applies Mario/Partner/Bowser actions,
     *          increments counters, checks for phase transition, and
     *          generates new predictions for the next turn.
     *
     * Game equivalent: EVS_TakeTurn_Inner (final_bowser_2.c:935 for Phase 2,
     *                  final_bowser_1.c:675 for Phase 1).
     */
    function handleNextTurn() {
        if (fightData.turn === 0 && fightData.phase === 1) {
            let predictions = handlePredictions(1, fightData.phase, fightData.Mario, fightData.Bowser, fightData.Partner);
            setFightData({
                ...fightData,
                turn: 1,
                Bowser: {
                    ...fightData.Bowser,
                    actionChances: predictions,
                }

            });
            successNotification("Hey!", "Remember to change Mario's HP accordingly! It matters!");
        } else if (!handleErrors()) {
            let mario = fightData.Mario;
            let bowser = fightData.Bowser;
            let partner = fightData.Partner;
            let turn = fightData.turn;
            let phase = fightData.phase;
            let first = fightData.first;

            // ── Mario's action ─────────────────────────────────────────
            // Game equivalent: player inputs are processed before Bowser's
            // turn. Beam removes Bowser's Star Rod enchant (shield = false).
            switch (mario.action) {
                case "attack":
                    if (bowser.hp - mario.damage <= 0) {
                        bowser.hp = 0;
                    } else {
                        bowser.hp -= mario.damage;
                    }
                    if (mario.buffed) {
                        mario.buffed = false;
                    }
                    break;
                case "boost":
                    mario.buffed = true;
                    break;
                case "beam":
                    bowser.shield = false;
                    bowser.turnsInfo.turnsSinceShield = 1;
                    break;
                case "skip":
                    break;
            }
            // ── Partner's action ───────────────────────────────────────
            // Game equivalent: partner inputs processed alongside Mario's.
            // Boost sets buffTurns (5 if Mario goes first, 4 otherwise).
            switch (partner.action) {
                case "attack":
                    if (bowser.hp - partner.damage <= 0) {
                        bowser.hp = 0;
                    } else {
                        bowser.hp -= partner.damage;
                    }
                    break;
                case "boost":
                    if (first === "Mario") {
                        partner.buffTurns = 5;
                    } else {
                        partner.buffTurns = 4;
                    }
                    break;
                case "skip":
                    break;
            }
            // ── Bowser's turn: counter increments ──────────────────────
            // Game: EVS_TakeTurn_Inner lines 936–941 (final_bowser_2.c)
            // All counters are incremented BEFORE action selection in the
            // game. In the calculator they are incremented here (after the
            // action is known) which produces the same final values but
            // makes the counter one-behind for the NEXT prediction.
            bowser.turnsInfo.turnsSinceClaw++;
            bowser.turnsInfo.turnsSinceHeal++;
            bowser.turnsInfo.turnsSinceStomp++;
            bowser.turnsInfo.turnsSinceShockwave++;
            bowser.turnsInfo.turnsSinceShield++;

            // ── Bowser's turn: counter resets ──────────────────────────
            // Game: each EVS_Attack_* script resets its counter to 0.
            // e.g. EVS_Attack_BodySlam (final_bowser_1.c:875)
            //       EVS_Attack_ClawSwipe (final_bowser_1.c:1095)
            //       EVS_UseDrainingShockwave (final_bowser_1.c:1180)
            switch (fightData.Bowser.action) {
                case "shield":
                    bowser.shield = true;
                    bowser.turnsInfo.turnsSinceShield = 0;
                    break;
                case "claw":
                    bowser.turnsInfo.turnsSinceClaw = 0;
                    break;
                case "heal":
                    if (bowser.heals < 3) {
                        bowser.heals++;
                        bowser.hp += 30;
                    }
                    // Reset carries the same +1 offset as the phase-init and
                    // shield/beam resets (see Logic.md §11.1) — resetting to
                    // 0 desynced the heal-eligibility window from the game's
                    // by one round.
                    bowser.turnsInfo.turnsSinceHeal = 1;
                    break;
                case "buttstomp":
                    bowser.turnsInfo.turnsSinceStomp = 0;
                    break;
                case "shockwave":
                    // Same +1-offset fix as turnsSinceHeal above (Logic.md §11.2).
                    bowser.turnsInfo.turnsSinceShockwave = 1;
                    break;
            }

            mario.action = "";
            mario.damage = 0;
            partner.action = "";
            partner.damage = 0;
            bowser.action = "";


            //Lowering buff turns
            if (partner.buffTurns > 0) {
                partner.buffTurns--;
            }

            // ── Phase transition ───────────────────────────────────────
            // After turn 2 (TurnCount ≥ 3 in game) the fight moves to
            // Phase 2. Counters are re-initialized to match EVS_Init
            // values from final_bowser_2.c. The game resets TurnCount to
            // 0; the calculator resets `turn` to 1 (1-indexed for the UI).
            //
            // Counter init values (final_bowser_2.c EVS_Init):
            //   TurnsSinceShockwave = 0  → calculator uses 1 (off-by-one
            //                              compensation, see § Counter Timing)
            //   TurnsSinceClawSwipe = 3  → calculator uses 3
            //   TurnsSinceBodySlam  = 3  → calculator uses 3
            //   TurnsSinceRecover   = 0  → calculator uses 1 (same reason)
            //   TurnsSinceStarBeam  = 0  → calculator uses 1 (same reason)
            turn++;
            if (turn >= 3 && phase === 1) {
                setActiveTab("second");
                phase = 2;
                turn = 1;
                bowser.turnsInfo.turnsSinceShockwave = 1;
                bowser.turnsInfo.turnsSinceClaw = 3;
                bowser.turnsInfo.turnsSinceStomp = 3;
                bowser.turnsInfo.turnsSinceShield = 1;
                bowser.turnsInfo.turnsSinceHeal = 1;
                mario.hp = mario.maxHP;
                mario.fp = mario.maxFP;
            }
            // ── Phase 1 scripted shield ────────────────────────────────
            // Game: final_bowser_1.c EVS_TakeTurn_Inner lines 682–707
            // TurnCount 2 forces Star Rod cast (shield).
            if (turn === 2 && phase === 1) {
                bowser.action = "shield";
            }

            // ── Generate next-turn prediction ──────────────────────────
            bowser.actionChances = handlePredictions(turn, phase, mario, bowser, partner);

            setFightData({
                ...fightData,
                Mario: mario,
                Bowser: bowser,
                Partner: partner,
                turn: turn,
                first: "Mario",
                phase: phase,
            });
        }
    }

    // ── Live prediction refresh ────────────────────────────────────────
    /** Re-runs predictions whenever HP, counters, or buff state changes. */
    function handleUpdatePredictions() {
        let turn = fightData.turn;
        let phase = fightData.phase;
        let mario = fightData.Mario;
        let bowser = fightData.Bowser;
        bowser.actionChances = handlePredictions(turn, phase, mario, bowser, fightData.Partner);
        setFightData({
            ...fightData,
            Bowser: bowser,
        });
    }

    // Ref always points to the latest handleUpdatePredictions so the
    // effect below can call it without listing it as a dependency.
    const updateRef = useRef(handleUpdatePredictions);
    updateRef.current = handleUpdatePredictions;

    // Keep predictions in sync when the user edits HP/buff values between turns.
    useEffect(() => {
        if (fightData.turn > 0) {
            console.log("Updating predictions");
            updateRef.current();
        }
    }, [fightData.Mario.hp, fightData.Bowser.hp, fightData.turn, fightData.phase,
        fightData.Bowser.turnsInfo.turnsSinceShockwave, fightData.Bowser.turnsInfo.turnsSinceClaw,
        fightData.Bowser.turnsInfo.turnsSinceStomp, fightData.Bowser.turnsInfo.turnsSinceShield,
        fightData.Bowser.turnsInfo.turnsSinceHeal, fightData.Mario.buffed, fightData.Bowser.heals]);
    
    return (
        <Box className={classes.box}>
            <Tabs value={activeTab} onTabChange={setActiveTab}>
                <Tabs.List grow>
                    <Tabs.Tab icon={<Image src={starBeam}/>} disabled={!(fightData.phase === 1)} value="first">Phase 1 -
                        Pre Twink</Tabs.Tab>
                    <Tabs.Tab icon={<Image src={peachBeam}/>} disabled={!(fightData.phase === 2)} value="second">Phase 2
                        -
                        Post Twink</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="first">
                    <PhaseOne resetFight={resetFight} handleNextTurn={handleNextTurn}/>
                </Tabs.Panel>
                <Tabs.Panel value="second">
                    <PhaseTwo resetFight={resetFight} handleNextTurn={handleNextTurn}/>
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}