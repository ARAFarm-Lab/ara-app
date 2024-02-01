import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CssBaseline, CssVarsProvider, extendTheme } from '@mui/joy';
import dayjs from 'dayjs';
import App from './pages/App.tsx'
import 'dayjs/locale/id'

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import './index.css'

const firebaseConfig = {
  apiKey: "AIzaSyDybZITMkE7sCujRU-MlJlSmwmg9agdBbA",
  authDomain: "ara-iot-97648.firebaseapp.com",
  projectId: "ara-iot-97648",
  storageBucket: "ara-iot-97648.appspot.com",
  messagingSenderId: "727147745837",
  appId: "1:727147745837:web:1429de955e8f9c81029ea4"
};

dayjs.locale('id')
const app = initializeApp(firebaseConfig);
getAnalytics(app)

const queryClient = new QueryClient()
const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          body: '#f1f3f4'
        }
      }
    },
    light: {
      palette: {
        background: {
          body: '#f1f3f4'
        }
      }
    },
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <CssVarsProvider
        theme={theme}
        defaultMode="light"
        modeStorageKey="sys_mode"
      >
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
