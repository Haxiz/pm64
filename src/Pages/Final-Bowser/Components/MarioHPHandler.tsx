import {Group, Image, Space, Stack} from "@mantine/core";
import HP from "../../../Assets/Icons/hp.png";
import getNumberIcon from "../../../Services/Actions/number.actions";
import minus from "../../../Assets/Icons/-.png";
import plus from "../../../Assets/Icons/+.png";
import React, {useContext} from "react";
import pageStyles from "../../../Styles/page.styles";
import {FightContext} from "../FinalBowser";
import errorNotification from "../../../Services/Utils/Notifications/error.util";

export default function MarioHPHandler() {
    const {classes} = pageStyles();
    const {fightData, setFightData} = useContext(FightContext);

    function handleMaxHP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (fightData.Mario.maxHP < 94) {
                    setFightData({...fightData, Mario: {...fightData.Mario, maxHP: fightData.Mario.maxHP + amount}});
                } else if (fightData.Mario.maxHP >= 95 && fightData.Mario.maxHP < 99) {
                    setFightData({...fightData, Mario: {...fightData.Mario, maxHP: 99}});
                } else {
                    errorNotification("Oh no!", "You can't increase your Max HP anymore!");
                }
                break;
            case "remove":
                if (fightData.Mario.maxHP === 99) {
                    setFightData({
                        ...fightData,
                        Mario: {...fightData.Mario, maxHP: 95, hp: fightData.Mario.hp > 95 ? 95 : fightData.Mario.hp}
                    });
                } else if (fightData.Mario.maxHP > 5) {
                    setFightData({
                        ...fightData, Mario: {
                            ...fightData.Mario,
                            maxHP: fightData.Mario.maxHP - amount,
                            hp: fightData.Mario.hp > fightData.Mario.maxHP - amount ? fightData.Mario.maxHP - amount : fightData.Mario.hp
                        }
                    })
                } else {
                    errorNotification("Oh no!", "You can't decrease your Max HP anymore!");
                }
                break;
            case "update":
                setFightData({...fightData, Mario: {...fightData.Mario, maxHP: amount}});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    function handleCurrentHP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (fightData.Mario.hp < 100) {
                    if (fightData.Mario.hp + amount > fightData.Mario.maxHP) {
                        errorNotification("Oh no!", "You can't increase your HP above your Max HP!");
                    } else {
                        setFightData({...fightData, Mario: {...fightData.Mario, hp: fightData.Mario.hp + amount}});
                    }
                } else {
                    errorNotification("Oh no!", "You can't increase your HP anymore!");
                }
                break;
            case "remove":
                if (fightData.Mario.hp > 0) {
                    setFightData({...fightData, Mario: {...fightData.Mario, hp: fightData.Mario.hp - amount}});
                } else {
                    errorNotification("Oh no!", "You can't decrease your HP anymore!");
                }
                break;
            case "update":
                setFightData({...fightData, Mario: {...fightData.Mario, hp: amount}});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    return (
        <Group>
            {/* Max HP */}
            <Stack>
                Max HP
                <Group>
                    <Image src={HP} height={29} width={44}/>
                    {getNumberIcon(fightData.Mario.maxHP, "red")}
                </Group>
                <Group>
                    <Space/>
                    <Image className={classes.hover} src={minus} height={22} width={22} onClick={() => {
                        handleMaxHP("remove", 5)
                    }}/>
                    <Space/>
                    <Image className={classes.hover} src={plus} height={22} width={22} onClick={() => {
                        handleMaxHP("add", 5)
                    }}/>
                </Group>
            </Stack>
            {/* Current HP */}
            <Stack>
                Current HP
                <Group>
                    <Image src={HP} height={29} width={44}/>
                    {getNumberIcon(fightData.Mario.hp, "white")}
                </Group>
                <Group>
                    <Space/>
                    <Image className={classes.hover} src={minus} height={22} width={22} onClick={() => {
                        handleCurrentHP("remove", 1)
                    }}/>
                    <Space/>
                    <Image className={classes.hover} src={plus} height={22} width={22} onClick={() => {
                        handleCurrentHP("add", 1)
                    }}/>
                </Group>
            </Stack>
        </Group>
    );
}