import { create } from 'zustand';
import { initDB } from '../utils/db';
import { calculateLevel, checkAchievements, XP_REWARDS } from '../utils/gamification';

const useProgressStore = create((set, get) => ({
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  achievements: [],
  dailyChallenge: {
    target: 3,
    current: 0,
    completed: false,
    date: null,
  },
  completedChallenges: 0, // total completed

  // Load from IndexedDB
  loadProgress: async () => {
    try {
      const db = await initDB();
      const progress = await db.get('progress', 'user');
      if (progress) {
        set({
          xp: progress.xp || 0,
          level: progress.level || 1,
          streak: progress.streak || 0,
          longestStreak: progress.longestStreak || 0,
          lastActiveDate: progress.lastActiveDate || null,
          achievements: progress.achievements || [],
          dailyChallenge: progress.dailyChallenge || { target: 3, current: 0, completed: false, date: null },
          completedChallenges: progress.completedChallenges || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load progress', error);
    }
  },

  // Save progress to IndexedDB
  saveProgress: async () => {
    try {
      const db = await initDB();
      const progress = {
        xp: get().xp,
        level: get().level,
        streak: get().streak,
        longestStreak: get().longestStreak,
        lastActiveDate: get().lastActiveDate,
        achievements: get().achievements,
        dailyChallenge: get().dailyChallenge,
        completedChallenges: get().completedChallenges,
      };
      await db.put('progress', progress, 'user');
    } catch (error) {
      console.error('Failed to save progress', error);
    }
  },

  // Add XP and check level up
  addXP: async (amount, reason = '') => {
    const newXP = get().xp + amount;
    set({ xp: newXP });
    const newLevel = calculateLevel(newXP);
    if (newLevel.level > get().level) {
      set({ level: newLevel.level });
      // Trigger level-up notification (we'll handle via listener)
    }
    await get().saveProgress();
    return { xp: newXP, level: newLevel.level };
  },

  // Update streak (call on any log)
  updateStreak: async (logDate = Date.now()) => {
    const today = new Date(logDate).toDateString();
    const lastActive = get().lastActiveDate;
    let newStreak = get().streak;
    let newLongest = get().longestStreak;

    if (lastActive !== today) {
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const currentDate = new Date(today);
        const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      if (newStreak > newLongest) {
        newLongest = newStreak;
      }

      set({
        streak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      });

      // Add XP for maintaining streak (optional)
      if (newStreak > 1 && newStreak % 7 === 0) {
        get().addXP(XP_REWARDS.STREAK_BONUS, 'Streak milestone');
      }

      await get().saveProgress();
    }
  },

  // Update daily challenge
  incrementDailyChallenge: async () => {
    const today = new Date().toDateString();
    const challenge = get().dailyChallenge;

    if (challenge.date !== today) {
      // Reset challenge for new day
      set({
        dailyChallenge: {
          target: 3,
          current: 1,
          completed: false,
          date: today,
        },
      });
    } else {
      if (!challenge.completed) {
        const newCurrent = challenge.current + 1;
        const completed = newCurrent >= challenge.target;
        set({
          dailyChallenge: {
            ...challenge,
            current: newCurrent,
            completed,
          },
        });
        if (completed) {
          get().addXP(XP_REWARDS.COMPLETE_DAILY, 'Daily challenge completed');
          set({ completedChallenges: get().completedChallenges + 1 });
        }
      }
    }
    await get().saveProgress();
  },

  // Check and unlock achievements (call after any data change)
  checkAchievements: async (items, logs) => {
    const newlyUnlocked = checkAchievements(get(), items, logs);
    if (newlyUnlocked.length > 0) {
      const newAchievementIds = newlyUnlocked.map(a => a.id);
      set({ achievements: [...get().achievements, ...newAchievementIds] });
      // Add XP for each achievement
      for (const ach of newlyUnlocked) {
        await get().addXP(ach.xp, `Achievement: ${ach.name}`);
      }
      // Return newly unlocked for UI to show modals
      return newlyUnlocked;
    }
    return [];
  },
}));

export default useProgressStore;
