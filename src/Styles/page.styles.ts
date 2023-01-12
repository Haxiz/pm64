import {createStyles} from "@mantine/core";

const pageStyles = createStyles((theme) => ({
    box: {
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[5],
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,
        border: `3px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,
    },
    hover: {
        "&:hover": {
            cursor: 'pointer',
        }
    }
}));
export default pageStyles;