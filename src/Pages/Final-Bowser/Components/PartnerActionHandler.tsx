import {Center, Chip, Divider, Image, NumberInput, Text} from "@mantine/core";
import wattBoost from "../../../Assets/Icons/watt-boost.png";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";

export default function PartnerActionHandler() {
    const {fightData, setFightData} = useContext(FightContext);

    return (
        <>
            <Text ta="center" mb={10}>Your Partner's Action this turn</Text>
            <Chip.Group position="center" multiple={false} value={fightData.Partner.action}
                        onChange={(value) => setFightData({
                            ...fightData,
                            Partner: {...fightData.Partner, action: value}
                        })}>
                <Chip value="attack" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Attack</Chip>
                <Chip value="boost" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Boost</Chip>
                <Chip value="skip" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Skip</Chip>
            </Chip.Group>
            <Divider mt={10} mb={10} variant="dashed"
                     hidden={fightData.Partner.action === "" || fightData.Partner.action === "skip"}/>
            <NumberInput min={0} max={99} value={fightData.Partner.damage} placeholder="How much damage?" hidden={!(fightData.Partner.action === "attack")}
                         onChange={(value) => value ? setFightData({
                             ...fightData,
                             Partner: {...fightData.Partner, damage: value}
                         }) : setFightData({
                             ...fightData,
                             Partner: {...fightData.Partner, damage: 0}
                         })}/>
            <Center>
                <Image src={wattBoost} width={48} height={48}
                       hidden={!(fightData.Partner.action === "boost")}/>
            </Center>
        </>
    );
}