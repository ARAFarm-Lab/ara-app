import userAPI from '@/apis/user';
import { UserInfo } from '@/stores/auh.types';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingIcon from '@mui/icons-material/Settings';
import { Grid, Typography } from '@mui/joy';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import { useQuery } from '@tanstack/react-query';
import { createLazyRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';

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
        <Grid flexDirection='column' display='flex' sx={{ minHeight: '100vh', background: 'white' }}>
            <Outlet />
            <BottomNavigation />
        </Grid>
    )
}

const BottomNavigation = () => {
    const navigate = useNavigate()
    const userInfo = useQuery<UserInfo>({
        queryFn: userAPI.getUserInfo,
        queryKey: [userAPI.QUERY_KEY_GET_USER_INFO],
        refetchOnWindowFocus: true
    })
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
                <Typography fontSize='sm'>Dashboard</Typography>
            </Tab>
            <Tab
                orientation="vertical"
                {...(currentIndex === 1 && { color: colors[1] })}
            >
                <ListItemDecorator>
                    <ScheduleIcon />
                </ListItemDecorator>
                <Typography fontSize='sm'>Penjadwalan</Typography>
            </Tab>
            <Tab
                orientation="vertical"
                {...(currentIndex === 2 && { color: colors[2] })}
            >
                <ListItemDecorator>
                    <SettingIcon />
                </ListItemDecorator>
                <Typography fontSize='sm'>Pengaturan</Typography>
            </Tab>
            {userInfo.data?.role == 99 && (
                <Tab
                    orientation="vertical"
                    {...(currentIndex === 3 && { color: colors[3] })}
                >
                    <ListItemDecorator>
                        <AdminPanelSettingsIcon />
                    </ListItemDecorator>
                    <Typography fontSize='sm'>Admin</Typography>
                </Tab>
            )}
        </TabList>
    </Tabs>
}

export const HomeRoute = createLazyRoute('/')({
    component: App
})
