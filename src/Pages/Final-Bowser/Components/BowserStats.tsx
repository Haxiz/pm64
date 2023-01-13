import {Box, Button, Center, Chip, Divider, Grid, Group, Image, NumberInput, Stack, Text} from "@mantine/core";
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
import bootBoost from "../../../Assets/Icons/boot-boost.png";
import hammerBoost from "../../../Assets/Icons/hammer-boost.png";
import wattBoost from "../../../Assets/Icons/watt-boost.png";
import starBeam from "../../../Assets/Icons/star-beam.png";
import peachBeam from "../../../Assets/Icons/peach-beam.png";

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
    const [MarioDamage, setMarioDamage] = React.useState<number>(0);
    const [PartnerDamage, setPartnerDamage] = React.useState<number>(0);

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
            <Grid gutter="xl" align="center">
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
                    <Text fz="xl" mb={10} ta="center">
                        Predicted Actions {turn !== 0 ? "- Turn " + turn : ""}
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
                            <Text ta="center" mb={10}>Your Action this turn</Text>
                            <Chip.Group position="center" multiple={false} value={MarioTurnAction}
                                        onChange={setMarioTurnAction}>
                                {/*
                                <Chip value="misc" disabled={turn === 0}>Misc</Chip>
                                <Chip value="item" disabled={turn === 0}>Item</Chip>
                                <Chip value="jump" disabled={turn === 0}>Jump</Chip>
                                <Chip value="hammer" disabled={turn === 0}>Hammer</Chip>
                                <Chip value="starPower" disabled={turn === 0}>Star Power</Chip>
                                */}
                                <Chip value="attack" disabled={turn === 0}>Attack</Chip>
                                <Chip value="boost" disabled={turn === 0}>Boost</Chip>
                                <Chip value="beam" disabled={turn === 0}>Star Beam</Chip>
                                <Chip value="skip" disabled={turn === 0}>Skip</Chip>
                            </Chip.Group>
                            <Divider mt={10} mb={10} variant="dashed"
                                     hidden={MarioTurnAction === "" || MarioTurnAction === "skip"}/>
                            <NumberInput placeholder="How much damage?" hidden={!(MarioTurnAction === "attack")}
                                         onChange={(v) => v ? setMarioDamage(v) : setMarioDamage(0)}/>
                            <Group position="center" hidden={!(MarioTurnAction === "boost")}>
                                <Image src={bootBoost} width={46} height={44}/>
                                or
                                <Image src={hammerBoost} width={46} height={44}/>
                            </Group>
                            <Group position="center" hidden={!(MarioTurnAction === "beam")}>
                                <Image src={starBeam} width={48} height={48}/>
                                or
                                <Image src={peachBeam} width={48} height={48}/>
                            </Group>
                        </Grid.Col>

                        <Divider orientation="vertical"/>

                        <Grid.Col sm={1} md={"auto"} span="auto">
                            <Text ta="center" mb={10}>Your Partner's Action this turn</Text>
                            <Chip.Group position="center" multiple={false} value={PartnerTurnAction}
                                        onChange={setPartnerTurnAction}>
                                <Chip value="attack" disabled={turn === 0}>Attack</Chip>
                                <Chip value="boost" disabled={turn === 0}>Boost</Chip>
                                <Chip value="skip" disabled={turn === 0}>Skip</Chip>
                            </Chip.Group>
                            <Divider mt={10} mb={10} variant="dashed"
                                     hidden={PartnerTurnAction === "" || PartnerTurnAction === "skip"}/>
                            <NumberInput placeholder="How much damage?" hidden={!(PartnerTurnAction === "attack")}
                                         onChange={(v) => v ? setPartnerDamage(v) : setPartnerDamage(0)}/>
                            <Center>
                                <Image src={wattBoost} width={48} height={48}
                                       hidden={!(PartnerTurnAction === "boost")}/>
                            </Center>
                        </Grid.Col>
                    </Grid>
                    <Divider mt={10} mb={10}/>
                    <Text ta="center" mb={10}>Bowser's Action this turn</Text>
                    <Chip.Group position="center" multiple={false} value={BowserTurnAction}
                                onChange={setBowserTurnAction}>
                        <Chip value="shield" disabled={turn === 0}>Shield</Chip>
                        <Chip value="fire" disabled={turn === 0}>Fire</Chip>
                        <Chip value="claw" disabled={turn === 0}>Claw</Chip>
                        <Chip value="heal" disabled={turn === 0}>Heal</Chip>
                        <Chip value="buttstomp" disabled={turn === 0}>Stomp</Chip>
                        <Chip value="thunder" disabled={turn === 0}>Thunder</Chip>
                        <Chip value="shockwave" disabled={turn === 0}>Wave</Chip>
                    </Chip.Group>
                </Grid.Col>

            </Grid>
        </Box>
    );
}