import { useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

export default function StreakCalendar({ logs, days = 60 }) {
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const logsByDate = logs.reduce((acc, log) => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const map = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = logsByDate[dateStr] || 0;
      return { date, count };
    });

    setHeatmap(map);
  }, [logs, days]);

  const getIntensityClass = (count) => {
    if (count === 0) return 'bg-slate-200 dark:bg-slate-700';
    if (count === 1) return 'bg-amber-200 dark:bg-amber-900';
    if (count <= 3) return 'bg-amber-400 dark:bg-amber-700';
    return 'bg-amber-600 dark:bg-amber-500';
  };

  // Group by week for display (weeks in rows, days in columns)
  const weeks = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-1 text-xs text-gray-500 mb-1">
          <div className="w-8"></div>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="w-4 text-center">{d}</div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1 mb-1">
            <div className="w-8 text-xs text-gray-500">
              {week[0] && format(week[0].date, 'MMM d')}
            </div>
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-4 h-4 rounded-sm ${getIntensityClass(day.count)}`}
                title={`${format(day.date, 'PPP')}: ${day.count} logs`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
