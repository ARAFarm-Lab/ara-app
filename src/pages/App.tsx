import './App.css';

import useAuthStore from '@/stores/auth';
import useNotification from '@/stores/notification';
import { Box, Button, Grid, LinearProgress, Snackbar, Typography } from '@mui/joy';
import { useQueryClient } from '@tanstack/react-query';
import {
  createRootRoute, createRoute, createRouter, Outlet, redirect, RouterProvider, useNavigate
} from '@tanstack/react-router';

const Root = () => {
  const notification = useNotification()
  const queryClient = useQueryClient()

  queryClient.setDefaultOptions({
    mutations: {
      onError: (error) => {
        console.log(error)
        notification.fire(error.message, 'danger')
      }
    }
  })

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Snackbar
        variant='soft'
        autoHideDuration={3000}
        color={notification.type}
        open={notification.is_open}
        onClose={notification.clear}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        endDecorator={
          <Button
            onClick={() => notification.clear()}
            size="sm"
            variant="soft"
            color={notification.type}
          >
            Tutup
          </Button>
        }
      >{notification.message}</Snackbar>

      <Outlet />
    </Box>
  )
}

// Root route section
const rootRoute = createRootRoute({
  component: Root,
})

// Home route section
const homeRoute = createRoute({
  beforeLoad: ({ location }) => {
    const accessToken = useAuthStore.getState().accessToken
    if (location.pathname == '/') {
      throw redirect({
        to: "/dashboard",
        replace: true
      })
    }

    if (!accessToken) {
      throw redirect({
        to: "/auth",
        replace: true
      })
    }
  },
  getParentRoute: () => rootRoute,
  path: '/',
}).lazy(() => import('./home').then(d => d.HomeRoute))

const dashboardRoute = createRoute({
  getParentRoute: () => homeRoute,
  path: '/dashboard',
  loader: () => <></>
}).lazy(() => import('./home/dashboard').then(d => d.DashboardRoute))

const scheduleRoute = createRoute({
  getParentRoute: () => homeRoute,
  path: '/schedule',
  loader: () => <></>
}).lazy(() => import('./home/schedule').then(d => d.ScheduleRoute))

const settingRoute = createRoute({
  getParentRoute: () => homeRoute,
  path: '/setting',
  loader: () => <></>
}).lazy(() => import('./home/setting').then(d => d.SettingRoute))

const adminRoute = createRoute({
  getParentRoute: () => homeRoute,
  path: '/admin',
  loader: () => <></>
}).lazy(() => import('./home/admin').then(d => d.AdminRoute))


// Auth route section
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
}).lazy(() => import('./auth').then(d => d.AuthRoute))

// Construct the route tree
const routeTree = rootRoute.addChildren([
  authRoute,
  homeRoute.addChildren([
    dashboardRoute,
    scheduleRoute,
    settingRoute,
    adminRoute
  ])
])

const ErrorPage = ({ message }: { message: string }) => {
  const navigate = useNavigate()
  return (
    <Grid sx={{ height: '100vh' }} container justifyContent='center' alignItems='center' flexDirection='column'>
      <Typography fontSize='5em'>:(</Typography>
      <Typography level='h4'>{message}</Typography>
      <Button sx={{ mt: 4 }} onClick={() => navigate({ to: '/dashboard' })}>Kembali</Button>
    </Grid>
  )
}

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => <Box><LinearProgress /></Box>,
  defaultErrorComponent: () => <ErrorPage message='Terjadi Kesalahan, Hubungi Admin' />,
  defaultNotFoundComponent: () => <ErrorPage message='Halaman Tidak Ditemukan.'/>,
  defaultPendingMs: 0,
  defaultPendingMinMs: 0
})

const App = () => <RouterProvider router={router} />

export default App
