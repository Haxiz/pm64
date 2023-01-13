import {Box, Button, Center, Divider, Grid, Group, Image, Stack, Text} from "@mantine/core";
import BowserSprite from "../../../Assets/Sprites/bowser.png";
import BowserSpriteDead from "../../../Assets/Sprites/bowser-dead.png";
import React, {useContext} from "react";
import pageStyles from "../../../Styles/page.styles";
import BowserHPHandler from "./BowserHPHandler";
import {FightContext} from "../FinalBowser";
import starRod from "../../../Assets/Sprites/star-rod.png";
import fire from "../../../Assets/Sprites/fire.png";
import claw from "../../../Assets/Sprites/claw.png";
import heal from "../../../Assets/Sprites/heal.png";
import butt from "../../../Assets/Sprites/mario-butt.png";
import thunder from "../../../Assets/Sprites/thunder.png";
import wave from "../../../Assets/Sprites/parakarry-dead.png";
import MarioActionHandler from "./MarioActionHandler";
import BowserActionHandler from "./BowserActionHandler";
import PartnerActionHandler from "./PartnerActionHandler";

export default function BowserStats() {
    const {classes} = pageStyles();
    const {fightData, setFightData} = useContext(FightContext);

    function resetFight() {
        setFightData({
            ...fightData,
            Mario: {
                ...fightData.Mario,
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
            Partner: {
                action: "",
                damage: 0,
            },
            turn: 0,
        });
    }

    function handleNextTurn() {
        let bowserHP = fightData.Bowser.hp;
        let bowserHeals = fightData.Bowser.heals;
        let bowserShield = fightData.Bowser.shield;
        let marioBuffed = fightData.Mario.buffed;

        // Handle Mario's turn
        switch (fightData.Mario.action) {
            case "attack":
                if (bowserHP - fightData.Mario.damage <= 0) {
                    bowserHP = 0;
                } else {
                    bowserHP -= fightData.Mario.damage;
                }
                break;
            case "boost":
                marioBuffed = true;
                break;
            case "beam":
                bowserShield = false;
                break;
            case "skip":
                break;
        }
        // Handle Partner's turn
        switch (fightData.Partner.action) {
            case "attack":
                if (bowserHP - fightData.Partner.damage <= 0) {
                    bowserHP = 0;
                } else {
                    bowserHP -= fightData.Partner.damage;
                }
                break;
            case "boost":
                marioBuffed = true;
                break;
            case "skip":
                break;
        }
        // Handle Bowser's turn
        let turnsInfo = fightData.Bowser.turnsInfo;
        turnsInfo.turnsSinceClaw++;
        turnsInfo.turnsSinceFire++;
        turnsInfo.turnsSinceHeal++;
        turnsInfo.turnsSinceStomp++;
        turnsInfo.turnsSinceThunder++;
        turnsInfo.turnsSinceShockwave++;
        turnsInfo.turnsSinceShield++;

        switch (fightData.Bowser.action) {
            case "shield":
                bowserShield = true;
                turnsInfo.turnsSinceShield = 0;
                break;
            case "fire":
                turnsInfo.turnsSinceFire = 0;
                break;
            case "claw":
                turnsInfo.turnsSinceClaw = 0;
                break;
            case "heal":
                if (bowserHeals < 3) {
                    bowserHeals++;
                    bowserHP += 30;
                }
                turnsInfo.turnsSinceHeal = 0;
                break;
            case "buttstomp":
                turnsInfo.turnsSinceStomp = 0;
                break;
            case "thunder":
                turnsInfo.turnsSinceThunder = 0;
                break;
            case "shockwave":
                turnsInfo.turnsSinceShockwave = 0;
                break;
        }

        setFightData({
            ...fightData,
            Mario: {
                ...fightData.Mario,
                buffed: marioBuffed,
                action: "",
                damage: 0,
            },
            Bowser: {
                ...fightData.Bowser,
                hp: bowserHP,
                heals: bowserHeals,
                shield: bowserShield,
                turnsInfo: turnsInfo,
                action: "",
            },
            Partner: {
                ...fightData.Partner,
                action: "",
                damage: 0,
            },
            turn: fightData.turn + 1,
        });
    }

    return (
        <Box className={classes.box}>
            <Grid gutter="xl" align="center">
                <Grid.Col sm={1} md={3}>
                    <Center>
                        <Stack>
                            <Image src={BowserSprite} height={230} width={228} hidden={!(fightData.Bowser.hp > 0)}/>
                            <Image src={BowserSpriteDead} height={230} width={168}
                                   hidden={!(fightData.Bowser.hp === 0)}/>
                            <BowserHPHandler/>
                            <Center>
                                <Group spacing="sm">
                                    <Button color="red" radius="xl" disabled={fightData.turn === 0} onClick={() => {
                                        resetFight()
                                    }}>Reset Fight</Button>
                                    <Button color="cyan" radius="xl" onClick={() => {
                                        handleNextTurn()
                                    }}> {fightData.turn === 0 ? "Start Fight" : "Next Turn"} </Button>
                                </Group>
                            </Center>
                        </Stack>
                    </Center>
                </Grid.Col>
                <Grid.Col sm={1} md="auto" span="auto">
                    <Text fz="xl" mb={10} ta="center">
                        Predicted Actions {fightData.turn !== 0 ? "- Turn " + fightData.turn : ""}
                    </Text>
                    <Divider mb={10}/>
                    <Grid align="center">
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Shield
                                <Image src={starRod} width={43} height={115}/>
                                {fightData.Bowser.actionChances.shield + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Fire
                                <Image src={fire} width={54} height={80}/>
                                {fightData.Bowser.actionChances.fire + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Claw
                                <Image src={claw} width={58} height={70}/>
                                {fightData.Bowser.actionChances.claw + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Heal
                                <Image src={heal} width={73} height={60}/>
                                {fightData.Bowser.actionChances.heal + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Stomp
                                <Image src={butt} width={56} height={70}/>
                                {fightData.Bowser.actionChances.buttstomp + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Thunder
                                <Image src={thunder} width={60} height={60}/>
                                {fightData.Bowser.actionChances.thunder + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Wave
                                <Image src={wave} width={80} height={53}/>
                                {fightData.Bowser.actionChances.shockwave + "%"}
                            </Stack>
                        </Grid.Col>
                    </Grid>
                    <Divider mt={10} mb={10}/>
                    <Grid gutter="xl" align="center">
                        <Grid.Col xs={"auto"} md={"auto"} span="auto">
                            <MarioActionHandler/>
                        </Grid.Col>
                        <Divider orientation="vertical"/>
                        <Grid.Col sm={1} md={"auto"} span="auto">
                            <PartnerActionHandler/>
                        </Grid.Col>
                    </Grid>
                    <Divider mt={10} mb={10}/>
                    <BowserActionHandler/>
                </Grid.Col>
            </Grid>
        </Box>
    );
}