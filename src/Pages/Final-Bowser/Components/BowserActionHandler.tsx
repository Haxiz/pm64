import {Chip, Text} from "@mantine/core";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";

export default function BowserActionHandler() {
    const {fightData, setFightData} = useContext(FightContext);
    return (
        <>
            <Text ta="center" mb={10}>Bowser's Action this turn</Text>
            <Chip.Group position="center" multiple={false} value={fightData.Bowser.action}
                        onChange={(value) => setFightData({
                            ...fightData,
                            Bowser: {...fightData.Bowser, action: value}
                        })}>
                <Chip style={{display: fightData.phase === 1 ? "none" : ""}} value="heal"
                      disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Heal</Chip>
                <Chip value="shield" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Shield</Chip>
                <Chip style={{display: fightData.phase === 1 ? "none" : ""}} value="shockwave"
                      disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Wave</Chip>
                <Chip style={{display: fightData.phase === 1 ? "none" : ""}} value="thunder"
                      disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Lightning</Chip>
                <Chip value="buttstomp" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Stomp</Chip>
                <Chip value="claw" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Claw</Chip>
                <Chip value="fire" disabled={fightData.turn === 0 || fightData.Bowser.hp === 0}>Fire</Chip>
            </Chip.Group>
        </>
    );
}