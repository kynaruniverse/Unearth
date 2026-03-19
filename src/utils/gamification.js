export const LEVELS = [
  { level: 1, name: 'Novice', xpNeeded: 0 },
  { level: 2, name: 'Explorer', xpNeeded: 100 },
  { level: 3, name: 'Tracker', xpNeeded: 250 },
  { level: 4, name: 'Collector', xpNeeded: 500 },
  { level: 5, name: 'Organizer', xpNeeded: 1000 },
  { level: 6, name: 'Guardian', xpNeeded: 2000 },
  { level: 7, name: 'Keeper', xpNeeded: 3500 },
  { level: 8, name: 'Master', xpNeeded: 5000 },
  { level: 9, name: 'Legend', xpNeeded: 7500 },
  { level: 10, name: 'Mythic', xpNeeded: 10000 },
];

export const XP_REWARDS = {
  STORE_ITEM: 10,
  FIND_ITEM: 5,
  MOVE_ITEM: 8,
  COMPLETE_DAILY: 50,
  STREAK_BONUS: 20,
  ACHIEVEMENT: 25,
};

export const ACHIEVEMENTS = [
  {
    id: 'first_item',
    name: 'First Steps',
    desc: 'Add your first item',
    icon: '🎯',
    xp: 25,
    condition: (items) => items.length >= 1,
  },
  {
    id: 'five_items',
    name: 'Collector',
    desc: 'Track 5 different items',
    icon: '📦',
    xp: 50,
    condition: (items) => items.length >= 5,
  },
  {
    id: 'ten_items',
    name: 'Hoarder',
    desc: 'Track 10 different items',
    icon: '🏆',
    xp: 100,
    condition: (items) => items.length >= 10,
  },
  {
    id: 'first_log',
    name: 'Pattern Builder',
    desc: 'Log your first location',
    icon: '📝',
    xp: 25,
    condition: (logs) => logs.length >= 1,
  },
  {
    id: 'ten_logs',
    name: 'Getting Organized',
    desc: 'Log 10 locations',
    icon: '📊',
    xp: 75,
    condition: (logs) => logs.length >= 10,
  },
  {
    id: 'fifty_logs',
    name: 'Memory Master',
    desc: 'Log 50 locations',
    icon: '🧠',
    xp: 150,
    condition: (logs) => logs.length >= 50,
  },
  {
    id: 'week_streak',
    name: 'Committed',
    desc: 'Maintain a 7-day streak',
    icon: '🔥',
    xp: 100,
    condition: (streak) => streak >= 7,
  },
  {
    id: 'month_streak',
    name: 'Dedicated',
    desc: 'Maintain a 30-day streak',
    icon: '⭐',
    xp: 250,
    condition: (streak) => streak >= 30,
  },
  {
    id: 'stored_master',
    name: 'Safe Keeper',
    desc: 'Store 10 items safely',
    icon: '🔐',
    xp: 75,
    condition: (logs) => logs.filter(l => l.type === 'stored').length >= 10,
  },
  {
    id: 'daily_champion',
    name: 'Daily Champion',
    desc: 'Complete 5 daily challenges',
    icon: '🎖️',
    xp: 150,
    condition: (completedChallenges) => completedChallenges >= 5,
  },
  {
    id: 'level_five',
    name: 'Rising Star',
    desc: 'Reach Level 5',
    icon: '🌟',
    xp: 200,
    condition: (level) => level >= 5,
  },
  // Add more as needed
];

export function calculateLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpNeeded) return LEVELS[i];
  }
  return LEVELS[0];
}

export function checkAchievements(userProgress, items, logs) {
  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach(ach => {
    if (!userProgress.achievements.includes(ach.id)) {
      let earned = false;
      if (ach.id.includes('streak')) {
        earned = ach.condition(userProgress.longestStreak);
      } else if (ach.id.includes('level')) {
        earned = ach.condition(userProgress.level);
      } else if (ach.id.includes('daily')) {
        earned = ach.condition(userProgress.completedChallenges || 0);
      } else if (ach.id.includes('items')) {
        earned = ach.condition(items);
      } else if (ach.id.includes('logs')) {
        earned = ach.condition(logs);
      }
      if (earned) {
        newlyUnlocked.push(ach);
      }
    }
  });
  return newlyUnlocked;
}
