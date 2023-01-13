import {Center, Chip, Divider, Group, Image, MediaQuery, NumberInput, Text} from "@mantine/core";
import watt from "../../../Assets/Icons/watt.png";
import wattBoost from "../../../Assets/Icons/watt-boost.png";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";
import x from "../../../Assets/Icons/x.png";
import getNumberIcon from "../../../Services/Actions/number.actions";

export default function PartnerActionHandler() {
    const {fightData, setFightData} = useContext(FightContext);

    return (
        <>
            <Group position="center">
                <Text ta="center" mb={10}>Your Partner's Action this turn</Text>
                <Chip.Group mb={10} position="center" multiple={false} value={fightData.first}
                            onChange={(value) => setFightData({...fightData, first: value})}>
                    <Chip value="Partner" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}
                          size="xs" color="green">First</Chip>
                </Chip.Group>
            </Group>
            <MediaQuery largerThan="md" styles={{display: "none"}}>
                <Divider mb={10} variant="dashed" />
            </MediaQuery>
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
            <NumberInput min={0} max={99} value={fightData.Partner.damage} placeholder="How much damage?"
                         hidden={!(fightData.Partner.action === "attack")}
                         onChange={(value) => value ? setFightData({
                             ...fightData,
                             Partner: {...fightData.Partner, damage: value}
                         }) : setFightData({
                             ...fightData,
                             Partner: {...fightData.Partner, damage: 0}
                         })}/>
            <Center hidden={!(fightData.Partner.action === "boost")}>
                <Group position="center">
                    <Image src={watt} width={48} height={48}/>
                    <Group spacing="xs">
                        <Image src={wattBoost} width={29} height={29}/>
                        <Image src={x} width={12} height={16}/>
                        {getNumberIcon(4, "white", false)}
                    </Group>
                </Group>
            </Center>
        </>
    );
}