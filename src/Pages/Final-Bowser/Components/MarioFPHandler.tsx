import pageStyles from "../../../Styles/page.styles";
import React, {useContext} from "react";
import {FightContext} from "../FinalBowser";
import errorNotification from "../../../Services/Utils/Notifications/error.util";
import {Group, Image, Space, Stack} from "@mantine/core";
import FP from "../../../Assets/Icons/fp.png";
import getNumberIcon from "../../../Services/Actions/number.actions";
import minus from "../../../Assets/Icons/-.png";
import plus from "../../../Assets/Icons/+.png";

export default function MarioFPHandler() {
    const {classes} = pageStyles();
    const {Mario, setMario} = useContext(FightContext);

    function handleMaxFP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (Mario.maxFP < 94) {
                    setMario({...Mario, maxFP: Mario.maxFP + amount});
                } else if (Mario.maxFP >= 95 && Mario.maxFP < 99) {
                    setMario({...Mario, maxFP: 99});
                } else {
                    errorNotification("Oh no!", "You can't increase your Max FP anymore!");
                }
                break;
            case "remove":
                if (Mario.maxFP === 99) {
                    setMario({...Mario, maxFP: 95, fp: Mario.fp > 95 ? 95 : Mario.fp});
                } else if (Mario.maxFP > 5) {
                    setMario({...Mario, maxFP: Mario.maxFP - amount, fp: Mario.fp > Mario.maxFP - amount ? Mario.maxFP - amount : Mario.fp});
                } else {
                    errorNotification("Oh no!", "You can't decrease your Max FP anymore!");
                }
                break;
            case "update":
                setMario({...Mario, maxFP: amount});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    function handleCurrentFP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (Mario.fp < 100) {
                    if (Mario.fp + amount > Mario.maxFP) {
                        errorNotification("Oh no!", "You can't increase your FP above your Max FP!");
                    } else {
                        setMario({...Mario, fp: Mario.fp + amount});
                    }
                } else {
                    errorNotification("Oh no!", "You can't increase your FP anymore!");
                }
                break;
            case "remove":
                if (Mario.fp > 0) {
                    setMario({...Mario, fp: Mario.fp - amount});
                } else {
                    errorNotification("Oh no!", "You can't decrease your FP anymore!");
                }
                break;
            case "update":
                setMario({...Mario, fp: amount});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    return (
        <Group>
            {/* Max FP */}
            <Stack>
                Max FP
                <Group>
                    <Image src={FP} height={29} width={44}/>
                    {getNumberIcon(Mario.maxFP, "red")}
                </Group>
                <Group>
                    <Space/>
                    <Image className={classes.hover} src={minus} height={22} width={22} onClick={() => {
                        handleMaxFP("remove", 5)
                    }}/>
                    <Space/>
                    <Image className={classes.hover} src={plus} height={22} width={22} onClick={() => {
                        handleMaxFP("add", 5)
                    }}/>
                </Group>
            </Stack>
            {/* Current FP */}
            <Stack>
                Current FP
                <Group>
                    <Image src={FP} height={29} width={44}/>
                    {getNumberIcon(Mario.fp, "white")}
                </Group>
                <Group>
                    <Space/>
                    <Image className={classes.hover} src={minus} height={22} width={22} onClick={() => {
                        handleCurrentFP("remove", 1)
                    }}/>
                    <Space/>
                    <Image className={classes.hover} src={plus} height={22} width={22} onClick={() => {
                        handleCurrentFP("add", 1)
                    }}/>
                </Group>
            </Stack>
        </Group>
    );

}