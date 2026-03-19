import { XP_REWARDS } from '../../utils/gamification';

export default function XPChart({ stats }) {
  // stats would contain counts per action type, e.g., storedCount, foundCount, etc.
  // For now, we'll use dummy data
  const data = [
    { label: 'Stored', value: stats?.storedCount || 0, xp: XP_REWARDS.STORE_ITEM },
    { label: 'Found', value: stats?.foundCount || 0, xp: XP_REWARDS.FIND_ITEM },
    { label: 'Moved', value: stats?.movedCount || 0, xp: XP_REWARDS.MOVE_ITEM },
    { label: 'Challenges', value: stats?.challengesCompleted || 0, xp: XP_REWARDS.COMPLETE_DAILY },
  ];

  const maxTotal = Math.max(...data.map(d => d.value * d.xp), 1);

  return (
    <div className="space-y-2">
      {data.map(item => {
        const totalXP = item.value * item.xp;
        const width = (totalXP / maxTotal) * 100;
        return (
          <div key={item.label}>
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span>{totalXP} XP</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
