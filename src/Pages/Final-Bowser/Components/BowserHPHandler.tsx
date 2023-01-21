import pageStyles from "../../../Styles/page.styles";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";
import errorNotification from "../../../Services/Utils/Notifications/error.util";
import {Button, Center, Collapse, Group, Image, Space, Stack} from "@mantine/core";
import HP from "../../../Assets/Icons/hp.png";
import getNumberIcon from "../../../Services/Actions/number.actions";
import minus from "../../../Assets/Icons/-.png";
import plus from "../../../Assets/Icons/+.png";

export default function BowserHPHandler() {
    const {classes} = pageStyles();
    const {fightData, setFightData} = useContext(FightContext);
    const [opened, setOpened] = React.useState(false);

    function handleCurrentHP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (fightData.Bowser.hp < 100) {
                    if (fightData.Bowser.hp + amount > fightData.Bowser.maxHP) {
                        errorNotification("Oh no!", "You can't increase Bowser's HP above his Max HP!");
                    } else {
                        setFightData({...fightData, Bowser: {...fightData.Bowser, hp: fightData.Bowser.hp + amount}});
                    }
                } else {
                    errorNotification("Oh no!", "You can't increase Bowser's HP anymore!");
                }
                break;
            case "remove":
                if (fightData.Bowser.hp > 0) {
                    setFightData({...fightData, Bowser: {...fightData.Bowser, hp: fightData.Bowser.hp - amount}});
                } else {
                    errorNotification("Oh no!", "You can't decrease Bowser's HP anymore!");
                }
                break;
            case "update":
                setFightData({...fightData, Bowser: {...fightData.Bowser, hp: amount}});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    return (
        <Center>
            <Stack align="center">
                Current HP
                <Group>
                    <Image src={HP} height={29} width={44}/>
                    {getNumberIcon(fightData.Bowser.hp, "white")}
                </Group>
                <Button onClick={() => setOpened((o) => !o)} size="sm" radius="xl" variant="subtle" compact
                        disabled={fightData.turn === 0}>
                    Toggle Manual HP
                </Button>
                <Collapse in={opened}>
                    <Group>
                        <Image className={classes.hover} src={minus} height={22} width={22} onClick={() => {
                            handleCurrentHP("remove", 1)
                        }}/>
                        <Space/>
                        <Image className={classes.hover} src={plus} height={22} width={22} onClick={() => {
                            handleCurrentHP("add", 1)
                        }}/>
                    </Group>
                </Collapse>
            </Stack>

        </Center>
    );
}