import { useEffect } from 'react';
import { LEVELS } from '../../utils/gamification';

export default function LevelUpModal({ newLevel, onClose }) {
  const levelData = LEVELS.find(l => l.level === newLevel);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!levelData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-brand-charcoal p-6 rounded-2xl max-w-sm text-center" onClick={e => e.stopPropagation()}>
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
        <div className="text-4xl font-bold text-amber-500 mb-2">{levelData.name}</div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">You've reached Level {newLevel}</p>
        <button onClick={onClose} className="bg-amber-500 text-white px-6 py-2 rounded-full">Awesome!</button>
      </div>
    </div>
  );
}
