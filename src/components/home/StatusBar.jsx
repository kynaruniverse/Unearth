import useProgressStore from '../../stores/progressStore';
import { calculateLevel } from '../../utils/gamification';

export default function StatusBar() {
  const { xp, streak } = useProgressStore();
  const level = calculateLevel(xp);
  const nextLevel = level.level < 10 ? level.level + 1 : level.level;
  const nextLevelXp = level.level < 10 ? 100 * Math.pow(2, level.level - 1) : level.xpNeeded; // or use LEVELS array
  const progress = ((xp - level.xpNeeded) / (nextLevelXp - level.xpNeeded)) * 100;

  return (
    <div className="flex items-center justify-between bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              className="text-amber-500"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {level.level}
          </span>
        </div>
        <div>
          <div className="font-bold">{level.name}</div>
          <div className="text-xs text-gray-500">{xp} / {nextLevelXp} XP</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-amber-500">🔥</span>
        <span className="font-bold">{streak} day streak</span>
      </div>
    </div>
  );
}
