import { Box, LinearProgress, Typography } from '@mui/joy';
import './App.css';

import { Outlet, RouterProvider, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import useAuthStore from '@/stores/auth';

// Root route section
const rootRoute = createRootRoute({
  component: () => (
    <Box sx={{ minHeight: '100vh' }}>
      <Outlet />
    </Box>
  ),
  notFoundComponent: () => <Typography>Halaman Tidak Ditemukan, Hubungi Admin</Typography>
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
    settingRoute
  ])
])

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => <Box><LinearProgress /></Box>,
  defaultErrorComponent: () => <Typography>Terjadi Kesalahan, Segera Hubungi Admin</Typography>,
  defaultPendingMs: 0,
  defaultPendingMinMs: 0
})

const App = () => <RouterProvider router={router} />

export default App
