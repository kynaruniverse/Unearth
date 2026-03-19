import { useState } from 'react';
import { Link } from 'react-router-dom';
import useItemStore from '../stores/itemStore';

export default function Items() {
  const { items } = useItemStore();
  const [search, setSearch] = useState('');

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Items</h1>
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4"
      />
      <div className="space-y-2">
        {filtered.map(item => (
          <Link
            key={item.id}
            to={`/items/${item.id}`}
            className="block p-4 bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">
                  Home: {item.homePlaceId ? 'Some place' : 'Not set'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
