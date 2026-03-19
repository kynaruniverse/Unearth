import { ACHIEVEMENTS } from '../../utils/gamification';

export default function AchievementGrid({ earnedIds }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {ACHIEVEMENTS.map(ach => {
        const earned = earnedIds.includes(ach.id);
        return (
          <div
            key={ach.id}
            className={`p-3 rounded-xl text-center border ${
              earned
                ? 'bg-amber-500/20 border-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 border-transparent opacity-50'
            }`}
          >
            <div className="text-3xl mb-1">{ach.icon}</div>
            <div className="font-bold text-sm">{ach.name}</div>
            <div className="text-xs text-gray-500">{ach.desc}</div>
            {earned && <div className="text-xs text-amber-500 mt-1">+{ach.xp} XP</div>}
          </div>
        );
      })}
    </div>
  );
}
