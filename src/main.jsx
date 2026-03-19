import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import useItemStore from './stores/itemStore';
import useProgressStore from './stores/progressStore';
import useThemeStore from './stores/themeStore';
import useSyncStore from './stores/syncStore';

// Initialize stores
async function initApp() {
  await useItemStore.getState().loadData();
  await useProgressStore.getState().loadProgress();
  useThemeStore.getState().initTheme();
  useSyncStore.getState().init();

  // Optional: register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
}

initApp();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
