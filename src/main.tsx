import 'dayjs/locale/id';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import * as Sentry from "@sentry/react";
import React from 'react';
import ReactDOM from 'react-dom/client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from '@/pages/App.tsx';

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

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  tracePropagationTargets: ["localhost", import.meta.env.VITE_BASE_URL],
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

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
