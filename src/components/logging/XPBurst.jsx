import { useState, useEffect } from 'react';

export default function XPBurst({ amount, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
      <div className="bg-amber-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
        +{amount} XP
      </div>
    </div>
  );
}
