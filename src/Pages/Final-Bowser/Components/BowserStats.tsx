import {Box, Button, Center, Chip, Divider, Grid, Group, Image, Stack, Text} from "@mantine/core";
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
import BowserActionsI from "../../../Types/bowserActions.types";


export default function BowserStats() {
    const {classes} = pageStyles();
    const {Bowser, setBowser, turn, setTurn} = useContext(FightContext);
    const [BowserActions, setBowserActions] = React.useState<BowserActionsI>({
        shield: 0,
        fire: 0,
        claw: 0,
        heal: 0,
        buttstomp: 0,
        thunder: 0,
        shockwave: 0,
    });
    const [BowserTurnAction, setBowserTurnAction] = React.useState<string>("");
    const [MarioTurnAction, setMarioTurnAction] = React.useState<string>("");
    const [PartnerTurnAction, setPartnerTurnAction] = React.useState<string>("");

    function resetFight() {
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
        setBowserActions({
            shield: 0,
            fire: 0,
            claw: 0,
            heal: 0,
            buttstomp: 0,
            thunder: 0,
            shockwave: 0,
        });
        setBowserTurnAction("");
        setMarioTurnAction("");
        setPartnerTurnAction("");
    }

    return (
        <Box className={classes.box}>
            <Grid gutter="xl">
                <Grid.Col sm={1} md={3}>
                    <Center>
                        <Stack>
                            <Image src={BowserSprite} height={230} width={228} hidden={!(Bowser.hp > 0)}/>
                            <Image src={BowserSpriteDead} height={230} width={168} hidden={!(Bowser.hp === 0)}/>
                            <BowserHPHandler/>
                            <Center>
                                <Group spacing="sm">
                                    <Button color="red" radius="xl" onClick={() => {
                                        resetFight()
                                    }}>Reset Fight</Button>
                                    <Button color="cyan" radius="xl" onClick={() => {
                                        setTurn(turn + 1)
                                    }}> {turn === 0 ? "Start Fight" : "Next Turn"} </Button>
                                </Group>
                            </Center>
                        </Stack>
                    </Center>
                </Grid.Col>
                <Grid.Col sm={1} md="auto" span="auto">
                    <Text mb={10}>
                        Predicted Actions - Turn {turn}
                    </Text>
                    <Divider mb={10}/>
                    <Grid align="center">
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Shield
                                <Image src={starRod} width={43} height={115}/>
                                {BowserActions.shield + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Fire
                                <Image src={fire} width={54} height={80}/>
                                {BowserActions.fire + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Claw
                                <Image src={claw} width={58} height={70}/>
                                {BowserActions.claw + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Heal
                                <Image src={heal} width={73} height={60}/>
                                {BowserActions.heal + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Stomp
                                <Image src={butt} width={56} height={70}/>
                                {BowserActions.buttstomp + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Thunder
                                <Image src={thunder} width={60} height={60}/>
                                {BowserActions.thunder + "%"}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Stack align="center">
                                Wave
                                <Image src={wave} width={80} height={53}/>
                                {BowserActions.shockwave + "%"}
                            </Stack>
                        </Grid.Col>
                    </Grid>
                    <Divider mt={10} mb={10}/>
                    <Grid gutter="xl" align="center">
                        <Grid.Col xs={"auto"} md={"auto"} span="auto">
                            <Text ta="center" mb={10}>Bowser's Action this turn</Text>
                            <Chip.Group position="center" multiple={false} value={BowserTurnAction} onChange={setBowserTurnAction}>
                                <Chip value="shield" disabled={turn === 0}>Shield</Chip>
                                <Chip value="fire" disabled={turn === 0}>Fire</Chip>
                                <Chip value="claw" disabled={turn === 0}>Claw</Chip>
                                <Chip value="heal" disabled={turn === 0}>Heal</Chip>
                                <Chip value="buttstomp" disabled={turn === 0}>Stomp</Chip>
                                <Chip value="thunder" disabled={turn === 0}>Thunder</Chip>
                                <Chip value="shockwave" disabled={turn === 0}>Wave</Chip>
                            </Chip.Group>
                        </Grid.Col>
                        <Divider orientation="vertical"/>
                        <Grid.Col sm={1} md={"auto"} span="auto">
                            <Text ta="center" mb={10}>Your Actions this turn</Text>
                            <Chip.Group position="center" multiple={false} value={MarioTurnAction} onChange={setMarioTurnAction}>
                                <Chip value="jump" disabled={turn === 0}>Jump</Chip>
                                <Chip value="hammer" disabled={turn === 0}>Hammer</Chip>
                                <Chip value="item" disabled={turn === 0}>Item</Chip>

                            </Chip.Group>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>

            </Grid>
        </Box>
    );
}