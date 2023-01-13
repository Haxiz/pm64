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
    const {fightData, setFightData} = useContext(FightContext);

    function handleMaxFP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (fightData.Mario.maxFP < 94) {
                    setFightData({...fightData, Mario: {...fightData.Mario, maxFP: fightData.Mario.maxFP + amount}});
                } else if (fightData.Mario.maxFP >= 95 && fightData.Mario.maxFP < 99) {
                    setFightData({...fightData, Mario: {...fightData.Mario, maxFP: 99}});
                } else {
                    errorNotification("Oh no!", "You can't increase your Max FP anymore!");
                }
                break;
            case "remove":
                if (fightData.Mario.maxFP === 99) {
                    setFightData({
                        ...fightData,
                        Mario: {...fightData.Mario, maxFP: 95, fp: fightData.Mario.fp > 95 ? 95 : fightData.Mario.fp}
                    });
                } else if (fightData.Mario.maxFP > 5) {
                    setFightData({
                        ...fightData, Mario: {
                            ...fightData.Mario,
                            maxFP: fightData.Mario.maxFP - amount,
                            fp: fightData.Mario.fp > fightData.Mario.maxFP - amount ? fightData.Mario.maxFP - amount : fightData.Mario.fp
                        }
                    });
                } else {
                    errorNotification("Oh no!", "You can't decrease your Max FP anymore!");
                }
                break;
            case "update":
                setFightData({...fightData, Mario: {...fightData.Mario, maxFP: amount}});
                break;
            default:
                errorNotification("Invalid action", action);
                break;
        }
    }

    function handleCurrentFP(action: string, amount: number) {
        switch (action) {
            case "add":
                if (fightData.Mario.fp < 100) {
                    if (fightData.Mario.fp + amount > fightData.Mario.maxFP) {
                        errorNotification("Oh no!", "You can't increase your FP above your Max FP!");
                    } else {
                        setFightData({...fightData, Mario: {...fightData.Mario, fp: fightData.Mario.fp + amount}});
                    }
                } else {
                    errorNotification("Oh no!", "You can't increase your FP anymore!");
                }
                break;
            case "remove":
                if (fightData.Mario.fp > 0) {
                    setFightData({...fightData, Mario: {...fightData.Mario, fp: fightData.Mario.fp - amount}});
                } else {
                    errorNotification("Oh no!", "You can't decrease your FP anymore!");
                }
                break;
            case "update":
                setFightData({...fightData, Mario: {...fightData.Mario, fp: amount}});
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
                    {getNumberIcon(fightData.Mario.maxFP, "red")}
                </Group>
                <Group hidden={!(fightData.turn === 0)}>
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
                    {getNumberIcon(fightData.Mario.fp, "white")}
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