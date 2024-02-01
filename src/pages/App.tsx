import { useState } from 'react';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Search from '@mui/icons-material/Search';
import Person from '@mui/icons-material/Person';
import './App.css'
import Home from './home';

const colors = ['primary', 'danger', 'success', 'warning'] as const;

const pages = [
  Home,
  () => <div>Page 2</div>,
  () => <div>Page 3</div>,
  () => <div>Page 4</div>,
]

function App() {
  const [tabIndex, setTabIndex] = useState<number>(0)
  return (
    <>
      <Page index={tabIndex} />
      <BottomNavigation currentIndex={tabIndex} onIndexChange={setTabIndex} />
    </>
  )
}

const Page = ({ index }: { index: number }) => {
  const Page = pages[index]
  return <div key={index} className='fade'>
    <Page />
  </div>
}

const BottomNavigation = ({ currentIndex, onIndexChange }: BottomNavigationProps) => {
  return <Tabs
    size="lg"
    aria-label="Bottom Navigation"
    value={currentIndex}
    onChange={(_, value) => onIndexChange(value as number)}
    sx={(theme) => ({
      p: 1,
      borderRadius: 16,
      m: 'auto 2em 2em 2em',
      position: 'sticky',
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
      variant="plain"
      size="sm"
      disableUnderline
      sx={{ borderRadius: 'lg', p: 0 }}
    >
      <Tab
        disableIndicator
        orientation="vertical"
        {...(currentIndex === 0 && { color: colors[0] })}
      >
        <ListItemDecorator>
          <HomeRoundedIcon />
        </ListItemDecorator>
        Home
      </Tab>
      <Tab
        disableIndicator
        orientation="vertical"
        {...(currentIndex === 1 && { color: colors[1] })}
      >
        <ListItemDecorator>
          <FavoriteBorder />
        </ListItemDecorator>
        Likes
      </Tab>
      <Tab
        disableIndicator
        orientation="vertical"
        {...(currentIndex === 2 && { color: colors[2] })}
      >
        <ListItemDecorator>
          <Search />
        </ListItemDecorator>
        Search
      </Tab>
      <Tab
        disableIndicator
        orientation="vertical"
        {...(currentIndex === 3 && { color: colors[3] })}
      >
        <ListItemDecorator>
          <Person />
        </ListItemDecorator>
        Profile
      </Tab>
    </TabList>
  </Tabs>
}

type BottomNavigationProps = {
  currentIndex: number
  onIndexChange: (index: number) => void
}

export default App
