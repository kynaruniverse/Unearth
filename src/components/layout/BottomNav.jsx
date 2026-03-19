import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-brand-charcoal border-t border-gray-200 dark:border-gray-800 flex justify-around p-2 z-50">
      <NavLink to="/" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
        <span className="text-xl">🏠</span>
        <span className="text-xs">Today</span>
      </NavLink>
      <NavLink to="/items" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
        <span className="text-xl">📦</span>
        <span className="text-xs">Items</span>
      </NavLink>
      <NavLink to="/places" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
        <span className="text-xl">📍</span>
        <span className="text-xs">Places</span>
      </NavLink>
      <NavLink to="/progress" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
        <span className="text-xl">📈</span>
        <span className="text-xs">Progress</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
        <span className="text-xl">⚙️</span>
        <span className="text-xs">Settings</span>
      </NavLink>
    </nav>
  );
}
