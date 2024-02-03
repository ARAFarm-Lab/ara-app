import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import App from './pages/App.tsx'
import 'dayjs/locale/id'

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import './index.css'
import { LocalizationProvider } from '@mui/x-date-pickers';

const firebaseConfig = {
  apiKey: "AIzaSyDybZITMkE7sCujRU-MlJlSmwmg9agdBbA",
  authDomain: "ara-iot-97648.firebaseapp.com",
  projectId: "ara-iot-97648",
  storageBucket: "ara-iot-97648.appspot.com",
  messagingSenderId: "727147745837",
  appId: "1:727147745837:web:1429de955e8f9c81029ea4"
};

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Jakarta');

const app = initializeApp(firebaseConfig);
getAnalytics(app)

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <App />
      </LocalizationProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
