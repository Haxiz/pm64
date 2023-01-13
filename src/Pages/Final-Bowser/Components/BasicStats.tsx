import {Box, Group, Image, Stack, Text} from "@mantine/core";
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
    const {fightData, setFightData} = useContext(FightContext);

    function handleBootCycle() {
        switch (fightData.Mario.boots) {
            case "Boots":
                setFightData({...fightData, Mario: {...fightData.Mario, boots: "Super Boots"}});
                break;
            case "Super Boots":
                setFightData({...fightData, Mario: {...fightData.Mario, boots: "Ultra Boots"}});
                break;
            case "Ultra Boots":
                setFightData({...fightData, Mario: {...fightData.Mario, boots: "Boots"}});
                break;
        }
    }

    function handleHammerCycle() {
        switch (fightData.Mario.hammer) {
            case "Hammer":
                setFightData({...fightData, Mario: {...fightData.Mario, hammer: "Super Hammer"}});
                break;
            case "Super Hammer":
                setFightData({...fightData, Mario: {...fightData.Mario, hammer: "Ultra Hammer"}});
                break;
            case "Ultra Hammer":
                setFightData({...fightData, Mario: {...fightData.Mario, hammer: "Hammer"}});
                break;
        }
    }

    return (
        <Box className={classes.box}>
            <Stack>
                <Text fz="xl" ta="center" >Basic Stats</Text>
                <Group position="center">
                    <Image src={MarioSprite} height={102} width={58} hidden={!(fightData.Mario.hp > 5)}/>
                    <Image src={MarioSpriteTired} height={102} width={70} hidden={!(fightData.Mario.hp <= 5 && fightData.Mario.hp > 0)}/>
                    <Image src={MarioSpriteDead} height={102} width={84} hidden={!(fightData.Mario.hp === 0)}/>
                    <Image src={danger} height={20} width={60} hidden={!(fightData.Mario.hp > 1 && fightData.Mario.hp <= 5)}/>
                    <Image src={peril} height={20} width={60} hidden={!(fightData.Mario.hp === 1)}/>
                    {getBootIcon(fightData.Mario.boots, handleBootCycle)}
                    {getHammerIcon(fightData.Mario.hammer, handleHammerCycle)}
                </Group>
                <Group position="center">
                    <MarioHPHandler/>
                    <MarioFPHandler/>
                </Group>
            </Stack>
        </Box>
    );
}