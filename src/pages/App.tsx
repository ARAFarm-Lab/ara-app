import { useEffect, useLayoutEffect, useState } from 'react';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingIcon from '@mui/icons-material/Settings';
import { Box } from '@mui/joy';
import loadable from '@loadable/component'
import './App.css';

const colors = ['primary', 'danger', 'success', 'warning'] as const;
const pages = [
  loadable(() => import('./home')),
  loadable(() => import('./schedule')),
  loadable(() => import('./setting'))
]

function App() {
  const [windowReady, setWindowReady] = useState<boolean>(false)
  const [tabIndex, setTabIndex] = useState<number>(0)

  useLayoutEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('t')) {
      const t = Number(urlParams.get('t'))
      if (t < 1 || t > pages.length) return
      setTabIndex(t - 1)
    }
    setWindowReady(true)
  }, [])

  useEffect(() => {
    if (!windowReady) return
    window.history.replaceState({}, '', `?t=${tabIndex + 1}`)
  }, [tabIndex, windowReady])

  return (
    <>
      <Page index={tabIndex} />
      <BottomNavigation currentIndex={tabIndex} onIndexChange={setTabIndex} />
    </>
  )
}

const Page = ({ index }: { index: number }) => {
  const Page = pages[index]
  return <Box key={index} sx={{ pb: 2 }} className='fade'>
    <Page />
  </Box>
}

const BottomNavigation = ({ currentIndex, onIndexChange }: BottomNavigationProps) => {
  return <Tabs
    size="lg"
    aria-label="Bottom Navigation"
    value={currentIndex}
    onChange={(_, value) => onIndexChange(value as number)}
    sx={(theme) => ({
      mt: 'auto',
      borderRadius: 16,
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      boxShadow: theme.shadow.sm,
      '--joy-shadowChannel': theme.vars.palette[colors[currentIndex]].darkChannel,
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

type BottomNavigationProps = {
  currentIndex: number
  onIndexChange: (index: number) => void
}

export default App
