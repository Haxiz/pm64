import {AppShell, useMantineTheme} from "@mantine/core";
import {useState} from "react";
import MantineNavbar from "./MantineNavbar";
import MantineHeader from "./MantineHeader";
import {Outlet} from "react-router-dom";
import BasicRedirect from "../../Routes/BasicRedirect";

export default function MantineShell() {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    return (
        <AppShell
            styles={{
                main: {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[2],
                }
            }}
            navbarOffsetBreakpoint="md"
            asideOffsetBreakpoint="md"
            navbar={
                <MantineNavbar opened={opened}></MantineNavbar>
            }
            header={
                <MantineHeader opened={opened} setOpened={setOpened}/>
            }
        >
            <BasicRedirect/>
            <Outlet/>
        </AppShell>
    );
}