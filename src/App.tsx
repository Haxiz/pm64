import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {ColorScheme, ColorSchemeProvider, MantineProvider} from "@mantine/core";
import Home from "./Pages/Home/Home";
import {NotificationsProvider} from "@mantine/notifications";

function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ?
                (() => {
                    localStorage.setItem('theme', 'light');
                    return 'light';
                })
                : (() => {
                    localStorage.setItem('theme', 'dark');
                    return 'dark';
                })
        ));

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider withGlobalStyles withNormalizeCSS theme={{colorScheme}}>
                <NotificationsProvider>
                    <Home/>
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default App;
