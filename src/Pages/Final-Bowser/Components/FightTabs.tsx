import pageStyles from "../../../Styles/page.styles";
import {useContext, useState} from "react";
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

export default function FightTabs() {
    const {classes} = pageStyles();
    const {fightData, setFightData} = useContext(FightContext);
    const [activeTab, setActiveTab] = useState<string | null>("first");

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

    function handlePredictions(turn: number, phase: number, mario: MarioI, bowser: BowserI) {
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
            //Heal
            let marioHPPercent = mario.hp / mario.maxHP * 100;
            let bowserHPPercent = bowser.hp / bowser.maxHP * 100;
            if (marioHPPercent - bowserHPPercent >= 25) {
                if (bowser.heals < 3 && bowser.turnsInfo.turnsSinceHeal >= 1) {
                    predictions.heal = handlePercentage(75, totalPredictionPercent);
                    totalPredictionPercent -= predictions.heal;
                }
            }
            // Shield
            if ((bowser.turnsInfo.turnsSinceShield > 1) && !bowser.shield) {
                if (bowser.turnsInfo.turnsSinceShield === 3) {
                    predictions.shield = handlePercentage(15, totalPredictionPercent);
                    totalPredictionPercent -= predictions.shield;
                } else if (bowser.turnsInfo.turnsSinceShield > 3) {
                    predictions.shield = handlePercentage(75, totalPredictionPercent);
                    totalPredictionPercent -= predictions.shield;
                }
            }
            // After shockwave
            if (bowser.turnsInfo.turnsSinceShockwave < 3) {
                if (totalPredictionPercent > 0) {
                    //Selecting normal move
                    if (bowser.turnsInfo.turnsSinceStomp > 1) {
                        //Stomp has 25% chance of being selected
                        predictions.buttstomp = handlePercentage(25, totalPredictionPercent);
                        totalPredictionPercent -= predictions.buttstomp;
                    }
                    if (bowser.turnsInfo.turnsSinceClaw > 1) {
                        //Claw has a 33% chance of being selected
                        predictions.claw = handlePercentage(33, totalPredictionPercent);
                        totalPredictionPercent -= predictions.claw;
                    }
                    //Fire takes the rest
                    predictions.fire = totalPredictionPercent;
                    totalPredictionPercent -= predictions.fire;
                }
            }
            // First 3 turns
            if (turn <= 3) {
                if (totalPredictionPercent > 0) {
                    //Selecting normal move
                    if (bowser.turnsInfo.turnsSinceStomp > 1) {
                        //Stomp has 25% chance of being selected
                        predictions.buttstomp = handlePercentage(25, totalPredictionPercent);
                        totalPredictionPercent -= predictions.buttstomp;
                    }
                    if (bowser.turnsInfo.turnsSinceClaw > 1) {
                        //Claw has a 33% chance of being selected
                        predictions.claw = handlePercentage(33, totalPredictionPercent);
                        totalPredictionPercent -= predictions.claw;
                    }
                    //Fire takes the rest
                    predictions.fire = totalPredictionPercent;
                    totalPredictionPercent -= predictions.fire;
                }
            }
            // Shockwave
            if (bowser.turnsInfo.turnsSinceShockwave >= 6) {
                if (totalPredictionPercent > 0) {
                    predictions.shockwave = handlePercentage(66, totalPredictionPercent);
                    totalPredictionPercent -= predictions.shockwave;
                    predictions.thunder = totalPredictionPercent;
                    totalPredictionPercent -= predictions.thunder;
                }
            }
            if (mario.buffed) {
                if (totalPredictionPercent > 0) {
                    predictions.shockwave = handlePercentage(75, totalPredictionPercent);
                    totalPredictionPercent -= predictions.shockwave;
                }
            } else {
                if (totalPredictionPercent > 0) {
                    predictions.shockwave = handlePercentage(handlePercentage(66, 27), totalPredictionPercent);
                    totalPredictionPercent -= predictions.shockwave;
                    predictions.thunder = handlePercentage(handlePercentage(34, 27), totalPredictionPercent);
                }
            }
            // Normal moves
            if (totalPredictionPercent > 0) {
                //Stomp has 25% chance of being selected
                predictions.buttstomp = handlePercentage(25, totalPredictionPercent);
                totalPredictionPercent -= predictions.buttstomp;
                //Claw has a 33% chance of being selected
                predictions.claw = handlePercentage(33, totalPredictionPercent);
                totalPredictionPercent -= predictions.claw;
                //Fire takes the rest
                predictions.fire = totalPredictionPercent;
                totalPredictionPercent -= predictions.fire;
            }
        }
        return predictions;
    }

    function handlePercentage(partialValue: number, totalValue: number) {
        return Math.floor((partialValue * totalValue) / 100);
    }

    function handleNextTurn() {
        if (fightData.turn === 0 && fightData.phase === 1) {
            let predictions = handlePredictions(1, fightData.phase, fightData.Mario, fightData.Bowser);
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

            // Handle Mario's turn
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
            // Handle Partner's turn
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
            // Handle Bowser's turn
            bowser.turnsInfo.turnsSinceClaw++;
            bowser.turnsInfo.turnsSinceHeal++;
            bowser.turnsInfo.turnsSinceStomp++;
            bowser.turnsInfo.turnsSinceShockwave++;
            bowser.turnsInfo.turnsSinceShield++;

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
                    bowser.turnsInfo.turnsSinceHeal = 0;
                    break;
                case "buttstomp":
                    bowser.turnsInfo.turnsSinceStomp = 0;
                    break;
                case "shockwave":
                    bowser.turnsInfo.turnsSinceShockwave = 0;
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

            // Updating turn info
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
            if (turn === 2 && phase === 1) {
                bowser.action = "shield";
            }

            // Getting Bowser's move prediction
            let predictions = handlePredictions(turn, phase, mario, bowser);
            bowser.actionChances = predictions;

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