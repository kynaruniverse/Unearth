import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import useItemStore from './stores/itemStore';
import useProgressStore from './stores/progressStore';
import useThemeStore from './stores/themeStore';
import useSyncStore from './stores/syncStore';

function Root() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      await useItemStore.getState().loadData();
      await useProgressStore.getState().loadProgress();
      useThemeStore.getState().initTheme();
      useSyncStore.getState().init();
      setLoaded(true);
    }
    init();
  }, []);

  if (!loaded) {
    return <div className="flex items-center justify-center h-screen">Loading Unearth...</div>;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
