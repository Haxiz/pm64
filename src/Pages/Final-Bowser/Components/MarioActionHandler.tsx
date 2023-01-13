import {Chip, Divider, Group, Image, NumberInput, Text} from "@mantine/core";
import bootBoost from "../../../Assets/Icons/boot-boost.png";
import hammerBoost from "../../../Assets/Icons/hammer-boost.png";
import starBeam from "../../../Assets/Icons/star-beam.png";
import peachBeam from "../../../Assets/Icons/peach-beam.png";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";

export default function MarioActionHandler() {
    const {fightData, setFightData} = useContext(FightContext);

    return (
        <>
            <Text ta="center" mb={10}>Your Action this turn</Text>
            <Chip.Group position="center" multiple={false} value={fightData.Mario.action}
                        onChange={(value) => setFightData({...fightData, Mario: {...fightData.Mario, action: value}})}>
                <Chip value="attack" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Attack</Chip>
                <Chip value="boost" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Boost</Chip>
                <Chip value="beam" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>{fightData.turn >= 3 ? "Peach Beam" : "Star Beam"}</Chip>
                <Chip value="skip" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Skip</Chip>
            </Chip.Group>
            <Divider mt={10} mb={10} variant="dashed"
                     hidden={fightData.Mario.action === "" || fightData.Mario.action === "skip"}/>
            <NumberInput min={0} max={99} value={fightData.Mario.damage} placeholder="How much damage?" hidden={!(fightData.Mario.action === "attack")}
                         onChange={(value) => value ? setFightData({
                             ...fightData,
                             Mario: {...fightData.Mario, damage: value}
                         }) : setFightData({...fightData, Mario: {...fightData.Mario, damage: 0}})}/>
            <Group position="center" hidden={!(fightData.Mario.action === "boost")}>
                <Image src={bootBoost} width={46} height={44}/>
                or
                <Image src={hammerBoost} width={46} height={44}/>
            </Group>
            <Group position="center" hidden={!(fightData.Mario.action === "beam")}>
                <Image src={starBeam} width={48} height={48}/>
                or
                <Image src={peachBeam} width={48} height={48}/>
            </Group>
        </>
    );
}