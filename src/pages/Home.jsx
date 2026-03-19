import StatusBar from '../components/home/StatusBar';
import QuickActions from '../components/home/QuickActions';
import DailyChallenge from '../components/home/DailyChallenge';
import RecentItems from '../components/home/RecentItems';

export default function Home() {
  return (
    <div className="p-4 space-y-6 pb-24">
      <StatusBar />
      <QuickActions />
      <DailyChallenge />
      <RecentItems />
    </div>
  );
}
