import { useEffect, useState } from 'react';
import BottomNav from './BottomNav';
import OfflineBanner from '../ui/OfflineBanner';

export default function Layout({ children }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <OfflineBanner />
      <main className="flex-1 pb-16 md:pb-0 md:pl-64">
        {children}
      </main>
      {!isDesktop && <BottomNav />}
      {/* For desktop, we'll add a sidebar later */}
    </div>
  );
}
