import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingIcon from '@mui/icons-material/Settings';
import { Outlet, createLazyRoute, useNavigate, useRouterState } from '@tanstack/react-router';
import { Grid } from '@mui/joy';

const colors = ['primary', 'danger', 'success', 'warning'] as const;
const tabs = [
    {
        path: '/dashboard',
        color: 'primary,'
    },
    {
        path: '/schedule',
        color: 'danger,'
    }, {
        path: '/setting',
        color: 'success,'
    },
    {
        path: '/admin',
        color: 'warning,'
    }
]

const App = () => {
    return (
        // <Box display='flex' flexDirection='column' sx={{ height: '100vh' }}>
        <Grid flexDirection='column' display='flex' sx={{ minHeight: '100vh', background: 'white' }}>
            <Outlet />
            <BottomNavigation />
        </Grid>
        // </Box>
    )
}

const BottomNavigation = () => {
    const navigate = useNavigate()
    const currentLocation = useRouterState({
        select: state => state.location
    })

    const currentIndex = tabs.findIndex(tab => tab.path == currentLocation.pathname)

    return <Tabs
        size="lg"
        aria-label="Bottom Navigation"
        value={currentIndex}
        onChange={(_, index) => navigate({ to: `${tabs[index as number].path}`, replace: true })}
        sx={(theme) => ({
            mt: 'auto',
            borderRadius: 16,
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            boxShadow: theme.shadow.sm,
            // '--joy-shadowChannel': theme.vars.palette[colors[currentIndex]].darkChannel,
            [`& .${tabClasses.root}`]: {
                py: 1,
                flex: 1,
                transition: '0.3s',
                fontWeight: 'md',
                fontSize: 'md',
                [`&:not(.${tabClasses.selected}):not(:hover)`]: {
                    opacity: 0.7,
                },
            },
        })}
    >
        <TabList
            variant='soft'
            size="sm"
            disableUnderline
        >
            <Tab
                orientation="vertical"
                {...(currentIndex === 0 && { color: colors[0] })}
            >
                <ListItemDecorator>
                    <HomeRoundedIcon />
                </ListItemDecorator>
                Dashboard
            </Tab>
            <Tab
                orientation="vertical"
                {...(currentIndex === 1 && { color: colors[1] })}
            >
                <ListItemDecorator>
                    <ScheduleIcon />
                </ListItemDecorator>
                Penjadwalan
            </Tab>
            <Tab
                orientation="vertical"
                {...(currentIndex === 2 && { color: colors[2] })}
            >
                <ListItemDecorator>
                    <SettingIcon />
                </ListItemDecorator>
                Pengaturan
            </Tab>
        </TabList>
    </Tabs>
}

export const HomeRoute = createLazyRoute('/')({
    component: App
})
