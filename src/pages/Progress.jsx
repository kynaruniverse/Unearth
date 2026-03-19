import { useState, useEffect } from 'react';
import useProgressStore from '../stores/progressStore';
import useItemStore from '../stores/itemStore';
import { calculateLevel, LEVELS } from '../utils/gamification';
import AchievementGrid from '../components/progress/AchievementGrid';
import StreakCalendar from '../components/progress/StreakCalendar';
import XPChart from '../components/progress/XPChart';
import LevelUpModal from '../components/progress/LevelUpModal';

export default function Progress() {
  const { xp, level, streak, longestStreak, achievements, completedChallenges } = useProgressStore();
  const { items, logs } = useItemStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [stats, setStats] = useState({
    storedCount: 0,
    foundCount: 0,
    movedCount: 0,
    challengesCompleted: completedChallenges,
  });

  // Watch for level changes
  useEffect(() => {
    const currentLevel = calculateLevel(xp);
    if (currentLevel.level > level) {
      setNewLevel(currentLevel.level);
      setShowLevelUp(true);
    }
  }, [xp, level]);

  // Calculate stats from logs
  useEffect(() => {
    const stored = logs.filter(l => l.type === 'stored').length;
    const found = logs.filter(l => l.type === 'found').length;
    const moved = logs.filter(l => l.type === 'moved').length;
    setStats({
      storedCount: stored,
      foundCount: found,
      movedCount: moved,
      challengesCompleted,
    });
  }, [logs, completedChallenges]);

  const levelInfo = calculateLevel(xp);
  const nextLevel = LEVELS.find(l => l.level === levelInfo.level + 1) || LEVELS[levelInfo.level - 1];
  const progress = nextLevel
    ? ((xp - levelInfo.xpNeeded) / (nextLevel.xpNeeded - levelInfo.xpNeeded)) * 100
    : 100;

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your Progress</h1>

      {/* Level Card */}
      <div className="bg-gradient-to-br from-amber-500 to-teal-500 p-6 rounded-2xl text-white">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray={`${progress}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              {levelInfo.level}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold">{levelInfo.name}</div>
            <div className="text-sm opacity-90">{xp} / {nextLevel?.xpNeeded || xp} XP</div>
          </div>
        </div>
      </div>

      {/* Streak Summary */}
      <div className="flex justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
        <div>
          <div className="text-xs text-gray-500">Current Streak</div>
          <div className="text-2xl font-bold">{streak} days</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Longest Streak</div>
          <div className="text-2xl font-bold">{longestStreak} days</div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
        <h2 className="font-semibold mb-2">Activity (last 60 days)</h2>
        <StreakCalendar logs={logs} days={60} />
      </div>

      {/* Achievements */}
      <div>
        <h2 className="font-semibold mb-3">Achievements</h2>
        <AchievementGrid earnedIds={achievements} />
      </div>

      {/* XP Breakdown */}
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
        <h2 className="font-semibold mb-3">XP Breakdown</h2>
        <XPChart stats={stats} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
          <div className="text-3xl mb-1">📦</div>
          <div className="text-xl font-bold">{items.length}</div>
          <div className="text-xs text-gray-500">Items</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
          <div className="text-3xl mb-1">📝</div>
          <div className="text-xl font-bold">{logs.length}</div>
          <div className="text-xs text-gray-500">Total Logs</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
          <div className="text-3xl mb-1">🎯</div>
          <div className="text-xl font-bold">{completedChallenges}</div>
          <div className="text-xs text-gray-500">Challenges</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-xl font-bold">{achievements.length}</div>
          <div className="text-xs text-gray-500">Badges</div>
        </div>
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal newLevel={newLevel} onClose={() => setShowLevelUp(false)} />
      )}
    </div>
  );
}
