import {
    Container,
    Grid,
    Text,
} from "@mantine/core";
import React, {useState} from "react";
import MarioI from "../../Types/mario.type";
import BowserI from "../../Types/bowser.types";
import BasicStats from "./Components/BasicStats";
import BowserStats from "./Components/BowserStats";
import PartnerI from "../../Types/partner.types";

interface FightDataI {
    Mario: MarioI,
    Partner: PartnerI,
    Bowser: BowserI,
    turn: number,
    first: string,
}

interface FightContextI {
    fightData: FightDataI,
    setFightData: React.Dispatch<React.SetStateAction<FightDataI>>,
}

export const FightContext = React.createContext<FightContextI>({} as FightContextI);

export default function FinalBowser() {
    const [fightData, setFightData] = useState<FightDataI>({
        Mario: {
            maxHP: 10,
            hp: 10,
            maxFP: 10,
            fp: 10,
            hammer: "Hammer",
            boots: "Boots",
            badges: [],
            items: [],
            buffed: false,
            action: "",
            damage: 0,
        },
        Partner: {
            action: "",
            damage: 0,
            buffTurns: 0,
        },
        Bowser: {
            maxHP: 99,
            hp: 99,
            heals: 0,
            shield: false,
            turnsInfo: {
                turnsSinceShield: 0,
                turnsSinceFire: 0,
                turnsSinceClaw: 0,
                turnsSinceHeal: 0,
                turnsSinceStomp: 0,
                turnsSinceThunder: 0,
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
        turn: 0,
        first: "Mario",
    })

    function resetData() {
        setFightData({
            Mario: {
                maxHP: 10,
                hp: 10,
                maxFP: 10,
                fp: 10,
                hammer: "Hammer",
                boots: "Boots",
                badges: [],
                items: [],
                buffed: false,
                action: "",
                damage: 0,
            },
            Partner: {
                action: "",
                damage: 0,
                buffTurns: 0,
            },
            Bowser: {
                maxHP: 99,
                hp: 99,
                heals: 0,
                shield: false,
                turnsInfo: {
                    turnsSinceShield: 0,
                    turnsSinceFire: 0,
                    turnsSinceClaw: 0,
                    turnsSinceHeal: 0,
                    turnsSinceStomp: 0,
                    turnsSinceThunder: 0,
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
            turn: 0,
            first: "Mario",
        });
    }

    const fightContext = {
        fightData,
        setFightData,
    }

    return (
        <FightContext.Provider value={fightContext}>
            <Container fluid>
                <Grid>
                    {/* Basic Stats */}
                    <Grid.Col md={3} lg={3}>
                        <Text fz="xl" fw={700} mb={15}>
                            {fightData.turn === 0 ? "Basic setup - Pre-fight" : "Turn " + fightData.turn}
                        </Text>
                        <BasicStats/>
                    </Grid.Col>
                    {/* Chances */}
                    <Grid.Col md={9} lg={9}>
                        <BowserStats/>
                    </Grid.Col>
                </Grid>
            </Container>
        </FightContext.Provider>
    );
}