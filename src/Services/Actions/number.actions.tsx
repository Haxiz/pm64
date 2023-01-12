import zeroW from "../../Assets/Icons/Numbers/0.png";
import oneW from "../../Assets/Icons/Numbers/1.png";
import twoW from "../../Assets/Icons/Numbers/2.png";
import treeW from "../../Assets/Icons/Numbers/3.png";
import fourW from "../../Assets/Icons/Numbers/4.png";
import fiveW from "../../Assets/Icons/Numbers/5.png";
import sixW from "../../Assets/Icons/Numbers/6.png";
import sevenW from "../../Assets/Icons/Numbers/7.png";
import eightW from "../../Assets/Icons/Numbers/8.png";
import nineW from "../../Assets/Icons/Numbers/9.png";
import zeroR from "../../Assets/Icons/Numbers/0-red.png";
import oneR from "../../Assets/Icons/Numbers/1-red.png";
import twoR from "../../Assets/Icons/Numbers/2-red.png";
import treeR from "../../Assets/Icons/Numbers/3-red.png";
import fourR from "../../Assets/Icons/Numbers/4-red.png";
import fiveR from "../../Assets/Icons/Numbers/5-red.png";
import sixR from "../../Assets/Icons/Numbers/6-red.png";
import sevenR from "../../Assets/Icons/Numbers/7-red.png";
import eightR from "../../Assets/Icons/Numbers/8-red.png";
import nineR from "../../Assets/Icons/Numbers/9-red.png";
import {Group, Image} from "@mantine/core";

export default function getNumberIcon(value: number, color: string) {
    let imageValues = [];
    if (value === 0) {
        imageValues.push(color === "white" ? zeroW : zeroR);
        imageValues.push(color === "white" ? zeroW : zeroR);
    }
    while (value !== 0) {
        let digit = value % 10;
        switch (digit) {
            case 0:
                imageValues.unshift(color === "white" ? zeroW : zeroR);
                break;
            case 1:
                imageValues.unshift(color === "white" ? oneW : oneR);
                break;
            case 2:
                imageValues.unshift(color === "white" ? twoW : twoR);
                break;
            case 3:
                imageValues.unshift(color === "white" ? treeW : treeR);
                break;
            case 4:
                imageValues.unshift(color === "white" ? fourW : fourR);
                break;
            case 5:
                imageValues.unshift(color === "white" ? fiveW : fiveR);
                break;
            case 6:
                imageValues.unshift(color === "white" ? sixW : sixR);
                break;
            case 7:
                imageValues.unshift(color === "white" ? sevenW : sevenR);
                break;
            case 8:
                imageValues.unshift(color === "white" ? eightW : eightR);
                break;
            case 9:
                imageValues.unshift(color === "white" ? nineW : nineR);
                break;
        }
        value = Math.floor(value / 10);
    }
    if (imageValues.length === 1) {
        imageValues.unshift(color === "white" ? zeroW : zeroR);
    }
    return (
        <Group spacing="xs">
            {imageValues.map((img, index) => {
                return <Image key={index} src={img} height={24} width={18}></Image>
            })}
        </Group>
    );
}