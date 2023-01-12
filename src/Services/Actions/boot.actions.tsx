import BasicBoots from "../../Assets/Icons/Items/boots.png"
import SuperBoots from "../../Assets/Icons/Items/super-boots.png"
import UltraBoots from "../../Assets/Icons/Items/ultra-boots.png"
import NoBoots from "../../Assets/Icons/Items/no-boots.png"
import {Image} from "@mantine/core";
import pageStyles from "../../Styles/page.styles";


export default function getBootIcon(name: string, bootCycle: any) {
    const {classes} = pageStyles();

    switch (name) {
        case "Boots":
            return <Image className={classes.hover} src={BasicBoots} height={60} width={65}
                          onClick={() => bootCycle()}/>
        case "Super Boots":
            return <Image className={classes.hover} src={SuperBoots} height={60} width={65}
                          onClick={() => bootCycle()}/>
        case "Ultra Boots":
            return <Image className={classes.hover} src={UltraBoots} height={60} width={65}
                          onClick={() => bootCycle()}/>
        case "No Boots":
            return <Image className={classes.hover} src={NoBoots} height={60} width={65}/>
        default:
            return <Image className={classes.hover} src={BasicBoots} height={60} width={65}
                          onClick={() => bootCycle()}/>
    }
}
