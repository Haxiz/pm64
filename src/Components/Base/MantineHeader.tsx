import {
    ActionIcon,
    Burger, Container,
    Flex,
    Group,
    Header,
    MediaQuery,
    Text,
    useMantineColorScheme,
    useMantineTheme
} from "@mantine/core";
import {Moon, Sun} from "tabler-icons-react";
import {useNavigate} from "react-router-dom";

export default function MantineHeader({opened, setOpened}: { opened: boolean, setOpened: Function }) {
    const theme = useMantineTheme();
    const {colorScheme, toggleColorScheme} = useMantineColorScheme();
    const navigate = useNavigate();

    return (
        <Header height={65} p="md">

            <Group position="apart">
                {/* Mobile view */}
                <MediaQuery largerThan="md" styles={{display: "none"}}>
                    <Burger
                        opened={opened}
                        onClick={() => setOpened((o: boolean) => !o)}
                        size="sm"
                        color={colorScheme === 'dark' ? theme.colors.dark[0] : theme.black}
                    />
                </MediaQuery>
                <Text
                    variant="gradient"
                    gradient={{from: 'indigo', to: 'cyan', deg: 45}}
                    sx={{fontFamily: 'Greycliff CF, sans-serif', ":hover": {cursor: "pointer"}}}
                    ta="center"
                    fw={700}
                    onClick={() => {navigate("/")}}
                >
                    Paper Mario 64 Fight Simulator
                </Text>
                <ActionIcon onClick={() => {
                    toggleColorScheme()
                }} size={36}>
                    {colorScheme === 'dark' ? <Sun size={36} strokeWidth={2} color={'yellow'}/> :
                        <Moon size={36} strokeWidth={2} color={'#4080bf'}/>}
                </ActionIcon>
            </Group>
        </Header>
    );
}