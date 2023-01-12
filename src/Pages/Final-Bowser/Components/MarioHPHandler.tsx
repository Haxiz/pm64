import {Group, Image, Space, Stack} from "@mantine/core";
import HP from "../../../Assets/Icons/hp.png";
import getNumberIcon from "../../../Services/Actions/number.actions";
import minus from "../../../Assets/Icons/-.png";
import plus from "../../../Assets/Icons/+.png";
import React, {useContext} from "react";
import pageStyles from "../../../Styles/page.styles";
import {FightContext} from "../FinalBowser";
import errorNotification from "../../../Services/Utils/Notifications/error.util";
import danger from "../../../Assets/Icons/danger.png";
import peril from "../../../Assets/Icons/peril.png";

export default function MarioHPHandler() {
    const {classes} = pageStyles();
    const {Mario, setMario} = useContext(FightContext);

    function handleMaxHP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (Mario.maxHP < 94) {
                    setMario({...Mario, maxHP: Mario.maxHP + amount});
                } else if (Mario.maxHP >= 95 && Mario.maxHP < 99) {
                    setMario({...Mario, maxHP: 99});
                } else {
                    errorNotification("Oh no!", "You can't increase your Max HP anymore!");
                }
                break;
            case "remove":
                if (Mario.maxHP === 99) {
                    setMario({...Mario, maxHP: 95, hp: Mario.hp > 95 ? 95 : Mario.hp});
                } else if (Mario.maxHP > 5) {
                    setMario({...Mario, maxHP: Mario.maxHP - amount, hp: Mario.hp > Mario.maxHP - amount ? Mario.maxHP - amount : Mario.hp});
                } else {
                    errorNotification("Oh no!", "You can't decrease your Max HP anymore!");
                }
                break;
            case "update":
                setMario({...Mario, maxHP: amount});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    function handleCurrentHP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (Mario.hp < 100) {
                    if (Mario.hp + amount > Mario.maxHP) {
                        errorNotification("Oh no!", "You can't increase your HP above your Max HP!");
                    } else {
                        setMario({...Mario, hp: Mario.hp + amount});
                    }
                } else {
                    errorNotification("Oh no!", "You can't increase your HP anymore!");
                }
                break;
            case "remove":
                if (Mario.hp > 0) {
                    setMario({...Mario, hp: Mario.hp - amount});
                } else {
                    errorNotification("Oh no!", "You can't decrease your HP anymore!");
                }
                break;
            case "update":
                setMario({...Mario, hp: amount});
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
                    {getNumberIcon(Mario.maxHP, "red")}
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
                    {getNumberIcon(Mario.hp, "white")}
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