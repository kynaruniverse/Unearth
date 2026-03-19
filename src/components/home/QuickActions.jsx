import { useState } from 'react';
import LogItemSheet from '../logging/LogItemSheet';

export default function QuickActions() {
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [logType, setLogType] = useState('stored'); // 'stored' or 'found'

  const openStored = () => {
    setLogType('stored');
    setShowLogSheet(true);
  };

  const openFound = () => {
    setLogType('found');
    setShowLogSheet(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={openStored}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-6 rounded-2xl flex flex-col items-center gap-2 transition"
        >
          <span className="text-4xl">📦</span>
          <span className="font-bold">I stored something</span>
          <span className="text-xs opacity-80">+10 XP</span>
        </button>
        <button
          onClick={openFound}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 p-6 rounded-2xl flex flex-col items-center gap-2 transition"
        >
          <span className="text-4xl">🔍</span>
          <span className="font-bold">I found something</span>
          <span className="text-xs opacity-80">+5 XP</span>
        </button>
      </div>

      {showLogSheet && (
        <LogItemSheet
          type={logType}
          onClose={() => setShowLogSheet(false)}
        />
      )}
    </>
  );
}
