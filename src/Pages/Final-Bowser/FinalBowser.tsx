import {
    Container,
    Grid,
    Text,
} from "@mantine/core";
import React, {useState} from "react";
import MarioI from "../../Types/mario.type";
import BowserI from "../../Types/bowser.types";
import BasicStats from "./Components/BasicStats";
import PartnerI from "../../Types/partner.types";
import FightTabs from "./Components/FightTabs";
import {isSaveLoadoutEnabled, loadSavedLoadout} from "../../Services/Utils/loadout.util";

interface FightDataI {
    Mario: MarioI,
    Partner: PartnerI,
    Bowser: BowserI,
    turn: number,
    first: string,
    phase: number,
}

interface FightContextI {
    fightData: FightDataI,
    setFightData: React.Dispatch<React.SetStateAction<FightDataI>>,
}

export const FightContext = React.createContext<FightContextI>({} as FightContextI);

/**
 * Mario's default loadout, used when no saved loadout applies. Extracted so
 * `buildInitialFightData` can fall back to it explicitly.
 */
const DEFAULT_MARIO_LOADOUT = {maxHP: 10, maxFP: 10, boots: "Ultra Boots", hammer: "Ultra Hammer"};

/**
 * Builds the initial fightData, applying the saved loadout (if the
 * "Remember Loadout" toggle was left on and a save exists) in place of the
 * hardcoded defaults. Current HP/FP start equal to max, same as the
 * pre-existing default shape.
 */
function buildInitialFightData(): FightDataI {
    const loadout = isSaveLoadoutEnabled() ? loadSavedLoadout() ?? DEFAULT_MARIO_LOADOUT : DEFAULT_MARIO_LOADOUT;

    return {
        Mario: {
            maxHP: loadout.maxHP,
            hp: loadout.maxHP,
            maxFP: loadout.maxFP,
            fp: loadout.maxFP,
            hammer: loadout.hammer,
            boots: loadout.boots,
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
        turn: 0,
        first: "Mario",
        phase: 1,
    };
}

export default function FinalBowser() {
    const [fightData, setFightData] = useState<FightDataI>(buildInitialFightData);

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
                        <FightTabs/>
                    </Grid.Col>
                </Grid>
            </Container>
        </FightContext.Provider>
    );
}