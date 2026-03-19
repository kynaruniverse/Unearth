import useThemeStore from '../stores/themeStore';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 bg-amber-500 text-white rounded-full"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </div>
  );
}
