import { Navbar } from '@mantine/core';
import NavbarButton from "./NavbarButton";
import BowserHead from "../../Assets/Icons/bowser-head.png"
import MarioHead from "../../Assets/Icons/mario-head.png"

export default function MantineNavbar({opened}: { opened: boolean }) {

    const elements = [
        {icon: MarioHead, height: 39, width: 42, label: "Home", to: "/home", },
        {icon: BowserHead, height: 43, width: 39, label: "Final Bowser", to: "/final-bowser"},
    ]
    const links = elements.map((link) => <NavbarButton {...link} key={link.label}/>)

    return (
        <Navbar width={{md: 200, lg: 300}} hidden={!opened} p="md" hiddenBreakpoint="md">
            <Navbar.Section grow mt="md">
                {links}
            </Navbar.Section>
        </Navbar>
    );
}