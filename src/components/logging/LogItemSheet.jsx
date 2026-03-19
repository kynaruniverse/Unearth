import { useState } from 'react';
import useItemStore from '../../stores/itemStore';
import useProgressStore from '../../stores/progressStore';
import { XP_REWARDS } from '../../utils/gamification';
import XPBurst from './XPBurst';

export default function LogItemSheet({ type, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [showNewItemInput, setShowNewItemInput] = useState(false);
  const [showNewPlaceInput, setShowNewPlaceInput] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  const { items, places, addItem, addPlace, addLog } = useItemStore();
  const { addXP, incrementDailyChallenge, updateStreak } = useProgressStore();

  const recentItems = items.slice(0, 5);
  const recentPlaces = places.slice(0, 5);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setStep(2);
  };

  const handleSelectPlace = async (place) => {
    setSelectedPlace(place);
    await addLog({
      itemId: selectedItem.id,
      placeId: place.id,
      type: type,
    });

    const xpEarned = type === 'stored' ? XP_REWARDS.STORE_ITEM : XP_REWARDS.FIND_ITEM;
    await addXP(xpEarned, `${type} item`);
    await updateStreak();
    await incrementDailyChallenge();

    setXpAmount(xpEarned);
    setShowXp(true);
    setTimeout(() => {
      setShowXp(false);
      onClose();
    }, 1000);
  };

  const handleCreateNewItem = async () => {
    if (!newItemName.trim()) return;
    const newItem = await addItem({ name: newItemName, emoji: '📦' });
    setSelectedItem(newItem);
    setShowNewItemInput(false);
    setNewItemName('');
    setStep(2);
  };

  const handleCreateNewPlace = async () => {
    if (!newPlaceName.trim()) return;
    const newPlace = await addPlace({ name: newPlaceName, emoji: '📍' });
    setSelectedPlace(newPlace);

    await addLog({
      itemId: selectedItem.id,
      placeId: newPlace.id,
      type: type,
    });

    const xpEarned = type === 'stored' ? XP_REWARDS.STORE_ITEM : XP_REWARDS.FIND_ITEM;
    await addXP(xpEarned, `${type} item`);
    await updateStreak();
    await incrementDailyChallenge();

    setXpAmount(xpEarned);
    setShowXp(true);
    setTimeout(() => {
      setShowXp(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-brand-charcoal w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-2 right-4 text-2xl" onClick={onClose}>&times;</button>

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">
              {type === 'stored' ? 'What did you store?' : 'What did you find?'}
            </h2>
            <div className="space-y-4">
              {recentItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
              {!showNewItemInput ? (
                <button
                  onClick={() => setShowNewItemInput(true)}
                  className="w-full p-4 border-2 border-dashed border-amber-500 rounded-xl text-amber-500 font-medium"
                >
                  + Add new item
                </button>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateNewItem}
                      className="flex-1 bg-amber-500 text-white p-2 rounded"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewItemInput(false)}
                      className="flex-1 bg-gray-300 dark:bg-slate-600 p-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">
              Where did you {type === 'stored' ? 'put it' : 'find it'}?
            </h2>
            <div className="space-y-4">
              {recentPlaces.map(place => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3"
                >
                  <span className="text-2xl">{place.emoji}</span>
                  <span className="font-medium">{place.name}</span>
                </button>
              ))}
              {!showNewPlaceInput ? (
                <button
                  onClick={() => setShowNewPlaceInput(true)}
                  className="w-full p-4 border-2 border-dashed border-amber-500 rounded-xl text-amber-500 font-medium"
                >
                  + Add new place
                </button>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <input
                    type="text"
                    placeholder="Place name"
                    value={newPlaceName}
                    onChange={(e) => setNewPlaceName(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateNewPlace}
                      className="flex-1 bg-amber-500 text-white p-2 rounded"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewPlaceInput(false)}
                      className="flex-1 bg-gray-300 dark:bg-slate-600 p-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showXp && <XPBurst amount={xpAmount} onComplete={() => setShowXp(false)} />}
    </div>
  );
}
