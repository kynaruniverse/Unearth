import useItemStore from '../../stores/itemStore';
import { Link } from 'react-router-dom';

export default function RecentItems() {
  const { items, places, logs } = useItemStore();

  // Get most recent logs and associated items
  const recentLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  const recentEntries = recentLogs.map(log => {
    const item = items.find(i => i.id === log.itemId);
    const place = places.find(p => p.id === log.placeId);
    return { log, item, place };
  }).filter(e => e.item && e.place);

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg">Recent Activity</h3>
      {recentEntries.length === 0 ? (
        <p className="text-gray-500 text-sm">No activity yet. Log your first item!</p>
      ) : (
        recentEntries.map(({ log, item, place }) => (
          <Link
            key={log.id}
            to={`/items/${item.id}`}
            className="block p-4 bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">
                  {log.type === 'stored' ? 'Stored at' : 'Found at'} {place.name} • {new Date(log.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
