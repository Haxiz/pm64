import {Box, Center, Grid, Group, Image, Space, Stack, Text} from "@mantine/core";
import MarioSprite from "../../../Assets/Sprites/mario.png";
import MarioSpriteTired from "../../../Assets/Sprites/mario-tired.png";
import MarioSpriteDead from "../../../Assets/Sprites/mario-dead.png";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";
import pageStyles from "../../../Styles/page.styles";
import getBootIcon from "../../../Services/Actions/boot.actions";
import getHammerIcon from "../../../Services/Actions/hammer.actions";
import MarioHPHandler from "./MarioHPHandler";
import MarioFPHandler from "./MarioFPHandler";
import danger from "../../../Assets/Icons/danger.png";
import peril from "../../../Assets/Icons/peril.png";

export default function BasicStats() {
    const {classes} = pageStyles();
    const {Mario, setMario} = useContext(FightContext);

    function handleBootCycle() {
        switch (Mario.boots) {
            case "Boots":
                setMario({...Mario, boots: "Super Boots"});
                break;
            case "Super Boots":
                setMario({...Mario, boots: "Ultra Boots"});
                break;
            case "Ultra Boots":
                setMario({...Mario, boots: "Boots"});
                break;
        }
    }

    function handleHammerCycle() {
        switch (Mario.hammer) {
            case "Hammer":
                setMario({...Mario, hammer: "Super Hammer"});
                break;
            case "Super Hammer":
                setMario({...Mario, hammer: "Ultra Hammer"});
                break;
            case "Ultra Hammer":
                setMario({...Mario, hammer: "Hammer"});
                break;
        }
    }

    return (
        <Box className={classes.box}>
            <Stack>
                <Text fz="xl">Basic Stats</Text>
                <Group>
                    <Image src={MarioSprite} height={102} width={58} hidden={!(Mario.hp > 5)}/>
                    <Image src={MarioSpriteTired} height={102} width={70} hidden={!(Mario.hp <= 5 && Mario.hp > 0)}/>
                    <Image src={MarioSpriteDead} height={102} width={84} hidden={!(Mario.hp === 0)}/>
                    <Image src={danger} height={20} width={60} hidden={!(Mario.hp > 1 && Mario.hp <= 5)}/>
                    <Image src={peril} height={20} width={60} hidden={!(Mario.hp === 1)}/>
                    {getBootIcon(Mario.boots, handleBootCycle)}
                    {getHammerIcon(Mario.hammer, handleHammerCycle)}
                </Group>
                <Group>
                    <MarioHPHandler/>
                    <MarioFPHandler/>
                </Group>
            </Stack>
        </Box>
    );
}