import { useParams, useNavigate } from 'react-router-dom';
import useItemStore from '../stores/itemStore';
import { useState } from 'react';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, places, logs, getLogsForItem, deleteItem } = useItemStore();
  const item = items.find(i => i.id === id);
  const itemLogs = getLogsForItem(id);
  const homePlace = item?.homePlaceId ? places.find(p => p.id === item.homePlaceId) : null;

  if (!item) return <div className="p-4">Item not found</div>;

  const handleDelete = async () => {
    if (confirm('Delete this item? All logs will be lost.')) {
      await deleteItem(id);
      navigate('/items');
    }
  };

  return (
    <div className="p-4 pb-24">
      <button onClick={() => navigate(-1)} className="mb-4 text-amber-500">← Back</button>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl">{item.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <p className="text-gray-500">
            Home: {homePlace ? homePlace.name : 'Not set'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">History</h2>
        {itemLogs.length === 0 ? (
          <p className="text-gray-500">No logs yet.</p>
        ) : (
          itemLogs.map(log => {
            const place = places.find(p => p.id === log.placeId);
            return (
              <div key={log.id} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{log.type === 'stored' ? 'Stored' : 'Found'} at </span>
                    <span>{place?.name || 'Unknown'}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={handleDelete}
        className="mt-6 w-full bg-red-500 text-white p-3 rounded-xl"
      >
        Delete Item
      </button>
    </div>
  );
}
