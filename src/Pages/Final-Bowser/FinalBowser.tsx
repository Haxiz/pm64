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

interface FightContextI {
    Mario: MarioI,
    setMario: React.Dispatch<React.SetStateAction<MarioI>>,
    Bowser: BowserI,
    setBowser: React.Dispatch<React.SetStateAction<BowserI>>
    turn: number,
    setTurn: React.Dispatch<React.SetStateAction<number>>
}

export const FightContext = React.createContext<FightContextI>({} as FightContextI);

export default function FinalBowser() {
    const [turn, setTurn] = useState(0);
    const [Mario, setMario] = useState<MarioI>({
        maxHP: 10,
        hp: 10,
        maxFP: 10,
        fp: 10,
        hammer: "Hammer",
        boots: "Boots",
        badges: [],
        items: [],
        buffed: false,
    });
    const [Bowser, setBowser] = useState<BowserI>({
        maxHP: 99,
        hp: 99,
        heals: 0,
        shield: false,
        turnsSinceHeal: 0,
        turnsSinceShockwave: 0,
        turnsSinceStarRod: 0,
        buffed: false,
    });

    const fightContext: FightContextI = {
        Mario: Mario,
        setMario: setMario,
        Bowser: Bowser,
        setBowser: setBowser,
        turn: turn,
        setTurn: setTurn
    }

    function resetData() {
        setMario({
            maxHP: 10,
            hp: 10,
            maxFP: 10,
            fp: 10,
            hammer: "Hammer",
            boots: "Boots",
            badges: [],
            items: [],
            buffed: false,
        });
        setBowser({
            maxHP: 99,
            hp: 99,
            heals: 0,
            shield: false,
            turnsSinceHeal: 0,
            turnsSinceShockwave: 0,
            turnsSinceStarRod: 0,
            buffed: false,
        });
        setTurn(0);
    }

    return (
        <FightContext.Provider value={fightContext}>
            <Container fluid>
                <Grid>
                    {/* Basic Stats */}
                    <Grid.Col xs={1} sm={3} md={3} lg={3}>
                        <Text fz="xl" fw={700} mb={15}>
                            {turn === 0 ? "Basic setup - Pre-fight" : "Turn " + turn}
                        </Text>
                        <BasicStats/>
                    </Grid.Col>
                    {/* Chances */}
                    <Grid.Col xs={1} sm={9} md={9} lg={9}>
                        <BowserStats/>
                    </Grid.Col>
                </Grid>
            </Container>
        </FightContext.Provider>
    );
}