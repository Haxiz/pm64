import WoodHammer from "../../Assets/Icons/Items/hammer.png"
import SuperHammer from "../../Assets/Icons/Items/super-hammer.png"
import UltraHammer from "../../Assets/Icons/Items/ultra-hammer.png"
import NoHammer from "../../Assets/Icons/Items/no-hammer.png"
import {Image} from "@mantine/core";
import pageStyles from "../../Styles/page.styles";

export default function getHammerIcon(name: string, hammerCycle: any) {
    const {classes} = pageStyles();

    switch (name) {
        case "Hammer":
            return <Image className={classes.hover} src={WoodHammer} height={60} width={65}
                          onClick={() => hammerCycle()}/>
        case "Super Hammer":
            return <Image className={classes.hover} src={SuperHammer} height={60} width={65}
                          onClick={() => hammerCycle()}/>
        case "Ultra Hammer":
            return <Image className={classes.hover} src={UltraHammer} height={60} width={65}
                          onClick={() => hammerCycle()}/>
        case "No Hammer":
            return <Image className={classes.hover} src={NoHammer} height={60} width={65}
                          onClick={() => hammerCycle()}/>
        default:
            return <Image className={classes.hover} src={WoodHammer} height={60} width={65}
                          onClick={() => hammerCycle()}/>
    }
}
