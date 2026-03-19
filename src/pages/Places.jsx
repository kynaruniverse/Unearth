import { useState } from 'react';
import useItemStore from '../stores/itemStore';

export default function Places() {
  const { places, items, addPlace, updatePlace, deletePlace } = useItemStore();
  const [editingPlace, setEditingPlace] = useState(null);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceEmoji, setNewPlaceEmoji] = useState('📍');
  const [showAddForm, setShowAddForm] = useState(false);

  // Count items per place
  const itemCountByPlace = items.reduce((acc, item) => {
    if (item.homePlaceId) {
      acc[item.homePlaceId] = (acc[item.homePlaceId] || 0) + 1;
    }
    return acc;
  }, {});

  const handleAddPlace = async () => {
    if (!newPlaceName.trim()) return;
    await addPlace({ name: newPlaceName, emoji: newPlaceEmoji });
    setNewPlaceName('');
    setNewPlaceEmoji('📍');
    setShowAddForm(false);
  };

  const handleUpdatePlace = async () => {
    if (!editingPlace || !newPlaceName.trim()) return;
    await updatePlace(editingPlace.id, { name: newPlaceName, emoji: newPlaceEmoji });
    setEditingPlace(null);
    setNewPlaceName('');
    setNewPlaceEmoji('📍');
  };

  const startEdit = (place) => {
    setEditingPlace(place);
    setNewPlaceName(place.name);
    setNewPlaceEmoji(place.emoji);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this place? Items stored here will lose their home.')) {
      await deletePlace(id);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Places</h1>

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4">
          <h3 className="font-semibold mb-2">{editingPlace ? 'Edit Place' : 'New Place'}</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Emoji"
              value={newPlaceEmoji}
              onChange={(e) => setNewPlaceEmoji(e.target.value)}
              className="w-16 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <input
              type="text"
              placeholder="Place name"
              value={newPlaceName}
              onChange={(e) => setNewPlaceName(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingPlace ? handleUpdatePlace : handleAddPlace}
              className="flex-1 bg-amber-500 text-white p-2 rounded"
            >
              {editingPlace ? 'Update' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingPlace(null);
                setNewPlaceName('');
                setNewPlaceEmoji('📍');
              }}
              className="flex-1 bg-gray-300 dark:bg-slate-600 p-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 mb-4 border-2 border-dashed border-amber-500 rounded-xl text-amber-500 font-medium"
        >
          + Add Place
        </button>
      )}

      {/* Places List */}
      <div className="space-y-3">
        {places.map(place => (
          <div key={place.id} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{place.emoji}</span>
              <div className="flex-1">
                <div className="font-medium">{place.name}</div>
                <div className="text-xs text-gray-500">
                  {itemCountByPlace[place.id] || 0} items stored here
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(place)} className="text-amber-500">✏️</button>
                <button onClick={() => handleDelete(place.id)} className="text-red-500">🗑️</button>
              </div>
            </div>

            {/* Show recent items in this place (max 3) */}
            <div className="mt-2 text-sm">
              {items.filter(item => item.homePlaceId === place.id).slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>{item.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
