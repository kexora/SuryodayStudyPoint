import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Handle background database closing, tab hidden, offline mode, or IndexedDB connection termination gracefully
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.toLowerCase().includes('database is closing') ||
      reasonStr.toLowerCase().includes('database connection is closing') ||
      reasonStr.toLowerCase().includes('indexeddb') ||
      reasonStr.toLowerCase().includes('firestore/unavailable') ||
      reasonStr.toLowerCase().includes('client is offline') ||
      reasonStr.toLowerCase().includes('could not reach cloud firestore') ||
      reasonStr.toLowerCase().includes('closing/hidden')
    ) {
      event.preventDefault();
      console.warn('Suppressed background database/network state notification gracefully.');
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = String(event.message || event.error?.message || '');
    if (
      errorMsg.toLowerCase().includes('database is closing') ||
      errorMsg.toLowerCase().includes('database connection is closing') ||
      errorMsg.toLowerCase().includes('client is offline') ||
      errorMsg.toLowerCase().includes('could not reach cloud firestore') ||
      errorMsg.toLowerCase().includes('closing/hidden')
    ) {
      event.preventDefault();
      console.warn('Suppressed background database/network error event gracefully.');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);


