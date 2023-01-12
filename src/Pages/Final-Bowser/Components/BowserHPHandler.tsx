import pageStyles from "../../../Styles/page.styles";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";
import errorNotification from "../../../Services/Utils/Notifications/error.util";
import {Center, Group, Image, Space, Stack} from "@mantine/core";
import HP from "../../../Assets/Icons/hp.png";
import getNumberIcon from "../../../Services/Actions/number.actions";
import minus from "../../../Assets/Icons/-.png";
import plus from "../../../Assets/Icons/+.png";

export default function BowserHPHandler() {
    const {classes} = pageStyles();
    const {Bowser, setBowser} = useContext(FightContext);

    function handleCurrentHP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (Bowser.hp < 100) {
                    if (Bowser.hp + amount > Bowser.maxHP) {
                        errorNotification("Oh no!", "You can't increase Bowser's HP above his Max HP!");
                    } else {
                        setBowser({...Bowser, hp: Bowser.hp + amount});
                    }
                } else {
                    errorNotification("Oh no!", "You can't increase Bowser's HP anymore!");
                }
                break;
            case "remove":
                if (Bowser.hp > 0) {
                    setBowser({...Bowser, hp: Bowser.hp - amount});
                } else {
                    errorNotification("Oh no!", "You can't decrease Bowser's HP anymore!");
                }
                break;
            case "update":
                setBowser({...Bowser, hp: amount});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    return (
        <Center>
            <Stack>
                Current HP
                <Group>
                    <Image src={HP} height={29} width={44}/>
                    {getNumberIcon(Bowser.hp, "white")}
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

        </Center>
    );
}