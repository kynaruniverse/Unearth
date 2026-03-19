import { create } from 'zustand';

const useThemeStore = create((set) => ({
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,

  toggleDarkMode: () => {
    set(state => {
      const newDark = !state.darkMode;
      if (newDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      return { darkMode: newDark };
    });
  },

  initTheme: () => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      const dark = saved === 'dark';
      set({ darkMode: dark });
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Follow system
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      set({ darkMode: systemDark });
      if (systemDark) {
        document.documentElement.classList.add('dark');
      }
    }
  },
}));

export default useThemeStore;
