import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";
import {Button, Center, Divider, Grid, Group, Image, Indicator, Stack, Text} from "@mantine/core";
import star from "../../../Assets/Icons/star.png";
import BowserSprite from "../../../Assets/Sprites/bowser.png";
import BowserSpriteDead from "../../../Assets/Sprites/bowser-dead.png";
import BowserHPHandler from "./BowserHPHandler";
import starRod from "../../../Assets/Sprites/star-rod.png";
import butt from "../../../Assets/Sprites/mario-butt.png";
import claw from "../../../Assets/Sprites/claw.png";
import fire from "../../../Assets/Sprites/fire.png";
import MarioActionHandler from "./MarioActionHandler";
import PartnerActionHandler from "./PartnerActionHandler";
import BowserActionHandler from "./BowserActionHandler";

export default function PhaseOne({resetFight, handleNextTurn}: any) {
    const {fightData} = useContext(FightContext);

    return (
        <Grid gutter="xl" align="center" mt={10}>
            <Grid.Col sm={3} md={3}>
                <Stack align="center">
                    <Indicator color="yellow" position="top-end" label={<Image src={star}/>} size={25}
                               withBorder processing hidden={!fightData.Bowser.shield} offset={20}>
                        <Image src={BowserSprite} height={230} width={228} hidden={!(fightData.Bowser.hp > 0)}/>
                    </Indicator>
                    <Image src={BowserSprite} style={{maxWidth: 228}}
                           hidden={!(fightData.Bowser.hp > 0) || fightData.Bowser.shield}/>
                    <Image src={BowserSpriteDead} height={230} width={168}
                           hidden={!(fightData.Bowser.hp === 0)}/>
                    <BowserHPHandler/>
                    <Center>
                        <Group spacing="sm">
                            <Button color="red" radius="xl" disabled={fightData.turn === 0} onClick={() => {
                                resetFight();
                            }}>Reset Fight</Button>
                            <Button color="cyan" radius="xl" disabled={fightData.Bowser.hp === 0}
                                    onClick={() => {
                                        handleNextTurn()
                                    }}> {fightData.turn === 0 ? "Start Fight" : "Next Turn"} </Button>
                        </Group>
                    </Center>
                </Stack>
            </Grid.Col>
            <Grid.Col md="auto" span="auto">
                <Group spacing="xs" position="center">
                    <Text fz="xl" mb={10} ta="center">
                        Predicted Actions {fightData.turn !== 0 ? " - Turn " + fightData.turn : ""}
                    </Text>
                </Group>
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
                            Stomp
                            <Image src={butt} width={56} height={70}/>
                            {fightData.Bowser.actionChances.buttstomp + "%"}
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
                            Fire
                            <Image src={fire} width={54} height={80}/>
                            {fightData.Bowser.actionChances.fire + "%"}
                        </Stack>
                    </Grid.Col>
                </Grid>
                <Divider mt={10} mb={10}/>
                <Grid gutter="xl" align="center">
                    <Grid.Col md={"auto"} span="auto">
                        <MarioActionHandler/>
                    </Grid.Col>
                    <Divider orientation="vertical"/>
                    <Grid.Col md={"auto"} span="auto">
                        <PartnerActionHandler/>
                    </Grid.Col>
                </Grid>
                <Divider mt={10} mb={10}/>
                <BowserActionHandler/>
            </Grid.Col>
        </Grid>
    );

}