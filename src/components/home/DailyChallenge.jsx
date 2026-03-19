import useProgressStore from '../../stores/progressStore';

export default function DailyChallenge() {
  const { dailyChallenge } = useProgressStore();
  const progress = (dailyChallenge.current / dailyChallenge.target) * 100;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 to-teal-500/20 p-4 rounded-2xl border border-amber-500/30">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Today's Challenge</h3>
        <span className="text-xs bg-amber-500/20 px-2 py-1 rounded-full">+50 XP</span>
      </div>
      <p className="text-sm mb-2">
        Log {dailyChallenge.target - dailyChallenge.current} more item{dailyChallenge.target - dailyChallenge.current !== 1 ? 's' : ''} you stored intentionally.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-medium">{dailyChallenge.current}/{dailyChallenge.target}</span>
      </div>
    </div>
  );
}
