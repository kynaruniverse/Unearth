// ============================================
// UNEARTH - GAMIFIED EXPERIENCE
// Advanced Level System, XP, Achievements, Streaks
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================
let appState = {
    items: [],
    currentItemId: null,
    currentScreen: 'home',
    darkMode: false,
    currentLogType: null, // 'found' or 'stored'
    
    // Gamification State
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    longestStreak: 0,
    achievements: [],
    dailyChallenge: {
        target: 3,
        current: 0,
        completed: false,
        date: null
    }
};

// ============================================
// GAMIFICATION CONSTANTS
// ============================================

// Level System - XP needed for each level
const LEVELS = [
    { level: 1, name: 'Beginner', xpNeeded: 100, perks: ['Basic tracking enabled'] },
    { level: 2, name: 'Novice', xpNeeded: 250, perks: ['Daily challenges unlocked', 'Streak tracking enabled'] },
    { level: 3, name: 'Organizer', xpNeeded: 500, perks: ['Advanced statistics', 'Custom tags coming soon'] },
    { level: 4, name: 'Expert', xpNeeded: 1000, perks: ['Priority support', 'Export features'] },
    { level: 5, name: 'Master', xpNeeded: 2000, perks: ['All features unlocked', 'Master badge'] },
    { level: 6, name: 'Legend', xpNeeded: 3500, perks: ['Legend status', 'Exclusive themes'] },
    { level: 7, name: 'Guru', xpNeeded: 5000, perks: ['Guru badge', 'Beta features access'] },
    { level: 8, name: 'Champion', xpNeeded: 7500, perks: ['Champion tier', 'Premium icons'] },
    { level: 9, name: 'Elite', xpNeeded: 10000, perks: ['Elite status', 'Early access to features'] },
    { level: 10, name: 'Ultimate', xpNeeded: 15000, perks: ['Ultimate rank', 'Everything unlocked!'] }
];

// XP Rewards
const XP_REWARDS = {
    ADD_ITEM: 10,
    LOG_LOCATION: 5,
    FIRST_LOG_TODAY: 15,
    COMPLETE_DAILY_CHALLENGE: 50,
    MAINTAIN_STREAK: 20,
    ACHIEVEMENT: 25
};

// Achievements System
const ACHIEVEMENTS = [
    {
        id: 'first_item',
        name: 'First Steps',
        desc: 'Add your first item',
        icon: '🎯',
        xp: 25,
        condition: () => appState.items.length >= 1
    },
    {
        id: 'five_items',
        name: 'Collector',
        desc: 'Track 5 different items',
        icon: '📦',
        xp: 50,
        condition: () => appState.items.length >= 5
    },
    {
        id: 'ten_items',
        name: 'Hoarder',
        desc: 'Track 10 different items',
        icon: '🏆',
        xp: 100,
        condition: () => appState.items.length >= 10
    },
    {
        id: 'first_log',
        name: 'Pattern Builder',
        desc: 'Log your first location',
        icon: '📝',
        xp: 25,
        condition: () => getTotalLogs() >= 1
    },
    {
        id: 'ten_logs',
        name: 'Getting Organized',
        desc: 'Log 10 locations',
        icon: '📊',
        xp: 75,
        condition: () => getTotalLogs() >= 10
    },
    {
        id: 'fifty_logs',
        name: 'Memory Master',
        desc: 'Log 50 locations',
        icon: '🧠',
        xp: 150,
        condition: () => getTotalLogs() >= 50
    },
    {
        id: 'week_streak',
        name: 'Committed',
        desc: 'Maintain a 7-day streak',
        icon: '🔥',
        xp: 100,
        condition: () => appState.longestStreak >= 7
    },
    {
        id: 'month_streak',
        name: 'Dedicated',
        desc: 'Maintain a 30-day streak',
        icon: '⭐',
        xp: 250,
        condition: () => appState.longestStreak >= 30
    },
    {
        id: 'stored_master',
        name: 'Safe Keeper',
        desc: 'Store 10 items safely',
        icon: '🔐',
        xp: 75,
        condition: () => {
            let storedCount = 0;
            appState.items.forEach(item => {
                storedCount += item.logs.filter(l => l.type === 'stored').length;
            });
            return storedCount >= 10;
        }
    },
    {
        id: 'consistent_logger',
        name: 'Creature of Habit',
        desc: 'Log same location 10 times',
        icon: '🔄',
        xp: 100,
        condition: () => {
            return appState.items.some(item => {
                const freq = item.getLocationFrequency();
                return Object.values(freq).some(count => count >= 10);
            });
        }
    },
    {
        id: 'daily_champion',
        name: 'Daily Champion',
        desc: 'Complete 5 daily challenges',
        icon: '🎖️',
        xp: 150,
        condition: () => {
            const completedChallenges = localStorage.getItem('completed_challenges') || 0;
            return parseInt(completedChallenges) >= 5;
        }
    },
    {
        id: 'level_five',
        name: 'Rising Star',
        desc: 'Reach Level 5',
        icon: '🌟',
        xp: 200,
        condition: () => appState.level >= 5
    }
];

// Milestones
const MILESTONES = [
    { id: 'items_5', title: 'Track 5 Items', desc: 'Add 5 items to your collection', icon: '📦', target: 5, type: 'items' },
    { id: 'items_10', title: 'Track 10 Items', desc: 'Expand to 10 items', icon: '📦', target: 10, type: 'items' },
    { id: 'logs_25', title: '25 Logs', desc: 'Record 25 locations', icon: '📝', target: 25, type: 'logs' },
    { id: 'logs_50', title: '50 Logs', desc: 'Record 50 locations', icon: '📝', target: 50, type: 'logs' },
    { id: 'logs_100', title: '100 Logs', desc: 'Record 100 locations', icon: '📝', target: 100, type: 'logs' },
    { id: 'streak_7', title: '7-Day Streak', desc: 'Log for 7 days in a row', icon: '🔥', target: 7, type: 'streak' },
    { id: 'streak_30', title: '30-Day Streak', desc: 'Log for 30 days in a row', icon: '🔥', target: 30, type: 'streak' }
];

// ============================================
// STORAGE
// ============================================
const STORAGE_KEY = 'unearth_data_v4';
const THEME_KEY = 'unearth_theme';
const PROGRESS_KEY = 'unearth_progress';

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.items));
        saveProgress();
    } catch (e) {
        console.error('Failed to save:', e);
        showToast('Failed to save data');
    }
}

function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            appState.items = JSON.parse(data);
        }
        loadProgress();
    } catch (e) {
        console.error('Failed to load:', e);
        appState.items = [];
    }
}

function saveProgress() {
    try {
        const progress = {
            xp: appState.xp,
            level: appState.level,
            streak: appState.streak,
            lastActiveDate: appState.lastActiveDate,
            longestStreak: appState.longestStreak,
            achievements: appState.achievements,
            dailyChallenge: appState.dailyChallenge
        };
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
        console.error('Failed to save progress:', e);
    }
}

function loadProgress() {
    try {
        const progress = localStorage.getItem(PROGRESS_KEY);
        if (progress) {
            const data = JSON.parse(progress);
            appState.xp = data.xp || 0;
            appState.level = data.level || 1;
            appState.streak = data.streak || 0;
            appState.lastActiveDate = data.lastActiveDate;
            appState.longestStreak = data.longestStreak || 0;
            appState.achievements = data.achievements || [];
            appState.dailyChallenge = data.dailyChallenge || { target: 3, current: 0, completed: false, date: null };
        }
        updateStreak();
        checkDailyChallenge();
    } catch (e) {
        console.error('Failed to load progress:', e);
    }
}

function loadTheme() {
    try {
        const theme = localStorage.getItem(THEME_KEY);
        if (theme === 'dark') {
            appState.darkMode = true;
            document.body.classList.add('dark-mode');
        }
    } catch (e) {
        console.error('Failed to load theme:', e);
    }
}

function saveTheme() {
    try {
        localStorage.setItem(THEME_KEY, appState.darkMode ? 'dark' : 'light');
    } catch (e) {
        console.error('Failed to save theme:', e);
    }
}

// ============================================
// ITEM CLASS
// ============================================
class Item {
    constructor(name, id = null) {
        this.id = id || Date.now().toString();
        this.name = name;
        this.createdAt = Date.now();
        this.logs = [];
    }

    addLog(location, type = 'found') {
        this.logs.push({
            timestamp: Date.now(),
            location: location,
            type: type
        });
    }

    getTotalLogs() {
        return this.logs.length;
    }

    getLocationFrequency() {
        const freq = {};
        this.logs.forEach(log => {
            freq[log.location] = (freq[log.location] || 0) + 1;
        });
        return freq;
    }

    getTopLocations(limit = 5) {
        const freq = this.getLocationFrequency();
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    getRecentLogs(limit = 10) {
        return [...this.logs]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    getLastKnownLocation() {
        if (this.logs.length === 0) return null;
        const stored = this.logs.filter(l => l.type === 'stored');
        if (stored.length > 0) {
            return stored[stored.length - 1].location;
        }
        return this.logs[this.logs.length - 1].location;
    }
}

// ============================================
// STATISTICS
// ============================================
function getTotalLogs() {
    return appState.items.reduce((sum, item) => sum + item.getTotalLogs(), 0);
}

function getMostLoggedItem() {
    if (appState.items.length === 0) return null;
    return appState.items.reduce((max, item) => 
        item.getTotalLogs() > (max?.getTotalLogs() || 0) ? item : max
    );
}

function getTopLocation() {
    const allLocations = {};
    appState.items.forEach(item => {
        const freq = item.getLocationFrequency();
        Object.entries(freq).forEach(([loc, count]) => {
            allLocations[loc] = (allLocations[loc] || 0) + count;
        });
    });
    
    const entries = Object.entries(allLocations);
    if (entries.length === 0) return null;
    
    return entries.reduce((max, curr) => curr[1] > max[1] ? curr : max)[0];
}

// ============================================
// GAMIFICATION LOGIC
// ============================================

function addXP(amount, reason = '') {
    appState.xp += amount;
    showXPGain(amount);
    checkLevelUp();
    checkAchievements();
    saveProgress();
    updateUI();
}

function checkLevelUp() {
    const currentLevelData = LEVELS.find(l => l.level === appState.level);
    if (!currentLevelData) return;
    
    if (appState.xp >= currentLevelData.xpNeeded) {
        appState.level++;
        const newLevelData = LEVELS.find(l => l.level === appState.level);
        
        if (newLevelData) {
            showLevelUpModal(newLevelData);
        }
        
        saveProgress();
    }
}

function checkAchievements() {
    const newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (!appState.achievements.includes(achievement.id) && achievement.condition()) {
            appState.achievements.push(achievement.id);
            newAchievements.push(achievement);
            addXP(achievement.xp, `Achievement: ${achievement.name}`);
        }
    });
    
    if (newAchievements.length > 0) {
        showAchievementModal(newAchievements[0]);
    }
    
    saveProgress();
}

function updateStreak() {
    const today = new Date().toDateString();
    
    if (appState.lastActiveDate === today) {
        return;
    }
    
    if (appState.lastActiveDate) {
        const lastDate = new Date(appState.lastActiveDate);
        const todayDate = new Date();
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            appState.streak++;
            if (appState.streak > appState.longestStreak) {
                appState.longestStreak = appState.streak;
            }
            addXP(XP_REWARDS.MAINTAIN_STREAK, 'Streak maintained');
        } else if (diffDays > 1) {
            appState.streak = 1;
        }
    } else {
        appState.streak = 1;
    }
    
    appState.lastActiveDate = today;
    addXP(XP_REWARDS.FIRST_LOG_TODAY, 'First log today');
    saveProgress();
}

function checkDailyChallenge() {
    const today = new Date().toDateString();
    
    if (appState.dailyChallenge.date !== today) {
        appState.dailyChallenge = {
            target: 3,
            current: 0,
            completed: false,
            date: today
        };
        saveProgress();
    }
}

function updateDailyChallenge() {
    appState.dailyChallenge.current++;
    
    if (appState.dailyChallenge.current >= appState.dailyChallenge.target && !appState.dailyChallenge.completed) {
        appState.dailyChallenge.completed = true;
        addXP(XP_REWARDS.COMPLETE_DAILY_CHALLENGE, 'Daily challenge completed!');
        showToast('🎉 Daily Challenge Complete! +50 XP');
        
        const count = parseInt(localStorage.getItem('completed_challenges') || '0');
        localStorage.setItem('completed_challenges', (count + 1).toString());
    }
    
    saveProgress();
}

// ============================================
// UI RENDERING
// ============================================

function updateUI() {
    updateHeader();
    updateDailyChallengeUI();
    updateQuickStats();
}

function updateHeader() {
    const levelData = LEVELS.find(l => l.level === appState.level) || LEVELS[0];
    const nextLevelData = LEVELS.find(l => l.level === appState.level + 1);
    
    document.getElementById('levelBadge').querySelector('.level-number').textContent = appState.level;
    
    const xpNeeded = levelData.xpNeeded;
    const prevLevelXP = appState.level > 1 ? LEVELS.find(l => l.level === appState.level - 1).xpNeeded : 0;
    const currentLevelXP = appState.xp - prevLevelXP;
    const neededForNext = xpNeeded - prevLevelXP;
    const progress = (currentLevelXP / neededForNext) * 100;
    
    document.getElementById('xpProgressFill').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('xpCurrent').textContent = appState.xp;
    document.getElementById('xpNeeded').textContent = xpNeeded;
    
    if (nextLevelData) {
        document.getElementById('nextLevelName').textContent = nextLevelData.name;
    }
}

function updateDailyChallengeUI() {
    const progress = (appState.dailyChallenge.current / appState.dailyChallenge.target) * 100;
    document.getElementById('challengeProgressFill').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('challengeCurrent').textContent = appState.dailyChallenge.current;
    document.getElementById('challengeTarget').textContent = appState.dailyChallenge.target;
    
    if (appState.dailyChallenge.completed) {
        document.getElementById('dailyChallenge').style.opacity = '0.6';
        document.querySelector('.challenge-desc').textContent = '✓ Completed!';
    }
}

function updateQuickStats() {
    document.getElementById('totalItems').textContent = appState.items.length;
    document.getElementById('totalLogs').textContent = getTotalLogs();
    document.getElementById('streakCount').textContent = appState.streak;
}

function renderHome() {
    updateUI();
    
    const itemsList = document.getElementById('itemsList');
    const emptyState = document.getElementById('emptyState');
    
    if (appState.items.length === 0) {
        itemsList.innerHTML = '';
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        
        const sortedItems = [...appState.items].sort((a, b) => {
            const aLast = a.logs.length > 0 ? a.logs[a.logs.length - 1].timestamp : a.createdAt;
            const bLast = b.logs.length > 0 ? b.logs[b.logs.length - 1].timestamp : b.createdAt;
            return bLast - aLast;
        });
        
        itemsList.innerHTML = sortedItems.map(item => {
            const lastLocation = item.getLastKnownLocation();
            return `
                <div class="item-card" data-item-id="${item.id}">
                    <div class="item-icon">${getItemEmoji(item.name)}</div>
                    <div class="item-info">
                        <div class="item-name">${escapeHtml(item.name)}</div>
                        <div class="item-stats">
                            ${item.getTotalLogs()} log${item.getTotalLogs() !== 1 ? 's' : ''}
                            ${lastLocation ? ` • Last: ${escapeHtml(lastLocation)}` : ''}
                        </div>
                    </div>
                    <div class="item-arrow">→</div>
                </div>
            `;
        }).join('');
        
        itemsList.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', () => {
                showItemDetail(card.dataset.itemId);
            });
        });
    }
}

function renderItemDetail(itemId) {
    const item = appState.items.find(i => i.id === itemId);
    if (!item) {
        showToast('Item not found');
        switchScreen('home');
        return;
    }
    
    document.getElementById('detailTitle').textContent = item.name;
    
    const commonLocations = document.getElementById('commonLocations');
    const noLocations = document.getElementById('noLocations');
    const topLocations = item.getTopLocations(5);
    
    if (topLocations.length === 0) {
        commonLocations.innerHTML = '';
        noLocations.classList.add('show');
    } else {
        noLocations.classList.remove('show');
        commonLocations.innerHTML = topLocations.map(([location, count]) => `
            <div class="location-chip" data-location="${escapeHtml(location)}">
                <span>${escapeHtml(location)}</span>
                <span class="location-count">${count}</span>
            </div>
        `).join('');
        
        commonLocations.querySelectorAll('.location-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const location = chip.dataset.location;
                document.getElementById('locationInput').value = location;
                showModal('logLocationModal');
            });
        });
    }
    
    const historyList = document.getElementById('historyList');
    const noHistory = document.getElementById('noHistory');
    const recentLogs = item.getRecentLogs(10);
    
    if (recentLogs.length === 0) {
        historyList.innerHTML = '';
        noHistory.classList.add('show');
    } else {
        noHistory.classList.remove('show');
        historyList.innerHTML = recentLogs.map(log => `
            <div class="history-item">
                <div class="history-location">${escapeHtml(log.location)}</div>
                <div class="history-meta">
                    <span class="history-type ${log.type}">${log.type}</span>
                    <span class="history-time">${formatTimeAgo(log.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }
}

function renderProgress() {
    const levelData = LEVELS.find(l => l.level === appState.level) || LEVELS[0];
    const prevLevelXP = appState.level > 1 ? LEVELS.find(l => l.level === appState.level - 1).xpNeeded : 0;
    
    document.getElementById('progressLevel').textContent = appState.level;
    document.getElementById('progressTitle').textContent = levelData.name;
    document.getElementById('levelNumber').textContent = appState.level;
    document.getElementById('levelTitle').textContent = levelData.name;
    
    const currentLevelXP = appState.xp - prevLevelXP;
    const neededForNext = levelData.xpNeeded - prevLevelXP;
    const progress = (currentLevelXP / neededForNext) * 100;
    
    document.getElementById('xpCurrentLarge').textContent = appState.xp;
    document.getElementById('xpNeededLarge').textContent = levelData.xpNeeded;
    document.getElementById('xpBarFillLarge').style.width = `${Math.min(progress, 100)}%`;
    
    const perksList = document.getElementById('perksList');
    perksList.innerHTML = levelData.perks.map(perk => `
        <div class="perk-item">✨ ${perk}</div>
    `).join('');
    
    const achievementsList = document.getElementById('achievementsList');
    const earnedCount = appState.achievements.length;
    document.getElementById('achievementsEarned').textContent = earnedCount;
    document.getElementById('achievementsTotal').textContent = ACHIEVEMENTS.length;
    
    achievementsList.innerHTML = ACHIEVEMENTS.map(achievement => {
        const earned = appState.achievements.includes(achievement.id);
        return `
            <div class="achievement ${earned ? 'earned' : ''}">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                <div class="achievement-xp">+${achievement.xp} XP</div>
            </div>
        `;
    }).join('');
    
    const milestonesList = document.getElementById('milestonesList');
    milestonesList.innerHTML = MILESTONES.map(milestone => {
        let current = 0;
        if (milestone.type === 'items') {
            current = appState.items.length;
        } else if (milestone.type === 'logs') {
            current = getTotalLogs();
        } else if (milestone.type === 'streak') {
            current = appState.longestStreak;
        }
        
        const completed = current >= milestone.target;
        const progress = Math.min((current / milestone.target) * 100, 100);
        
        return `
            <div class="milestone ${completed ? 'completed' : ''}">
                <div class="milestone-icon">${milestone.icon}</div>
                <div class="milestone-content">
                    <div class="milestone-title">${milestone.title}</div>
                    <div class="milestone-desc">${milestone.desc}</div>
                    <div class="milestone-progress">
                        <div class="milestone-progress-bar">
                            <div class="milestone-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="milestone-count">${current}/${milestone.target}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('statsTotal').textContent = getTotalLogs();
    
    const mostLogged = getMostLoggedItem();
    document.getElementById('statsMostLogged').textContent = 
        mostLogged ? escapeHtml(mostLogged.name) : '—';
    
    const topLoc = getTopLocation();
    document.getElementById('statsTopLocation').textContent = 
        topLoc ? escapeHtml(topLoc) : '—';
    
    document.getElementById('statsLongestStreak').textContent = appState.longestStreak;
}

// ============================================
// SCREEN NAVIGATION
// ============================================
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(`${screenName}Screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenName;
        
        document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.nav-btn[data-screen="${screenName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        switch(screenName) {
            case 'home':
                renderHome();
                break;
            case 'progress':
                renderProgress();
                break;
        }
    }
}

function showItemDetail(itemId) {
    appState.currentItemId = itemId;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('detailScreen').classList.add('active');
    renderItemDetail(itemId);
}

// ============================================
// MODALS
// ============================================
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        const input = modal.querySelector('input[type="text"]');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
        });
    }
}

function showLevelUpModal(levelData) {
    document.getElementById('newLevelNumber').textContent = levelData.level;
    document.getElementById('newLevelName').textContent = levelData.name;
    
    const perksList = document.getElementById('newPerksList');
    perksList.innerHTML = levelData.perks.map(perk => `<li>${perk}</li>`).join('');
    
    showModal('levelUpModal');
}

function showAchievementModal(achievement) {
    document.getElementById('unlockedAchievementIcon').textContent = achievement.icon;
    document.getElementById('unlockedAchievementName').textContent = achievement.name;
    document.getElementById('unlockedAchievementDesc').textContent = achievement.desc;
    document.getElementById('unlockedAchievementXP').textContent = achievement.xp;
    
    showModal('achievementModal');
}

function showXPGain(amount) {
    const xpGain = document.getElementById('xpGain');
    document.getElementById('xpGainAmount').textContent = amount;
    xpGain.classList.remove('hidden');
    
    setTimeout(() => {
        xpGain.classList.add('hidden');
    }, 1000);
}

// ============================================
// ITEM MANAGEMENT
// ============================================
function addItem(name) {
    if (!name || name.trim() === '') {
        showToast('Please enter an item name');
        return false;
    }
    
    const trimmedName = name.trim();
    
    if (appState.items.some(item => item.name.toLowerCase() === trimmedName.toLowerCase())) {
        showToast('Item already exists');
        return false;
    }
    
    const newItem = new Item(trimmedName);
    appState.items.push(newItem);
    
    addXP(XP_REWARDS.ADD_ITEM, 'Added new item');
    saveData();
    checkAchievements();
    
    showToast(`${trimmedName} added! +${XP_REWARDS.ADD_ITEM} XP`);
    return true;
}

function deleteItem(itemId) {
    const index = appState.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
        const itemName = appState.items[index].name;
        appState.items.splice(index, 1);
        saveData();
        showToast(`${itemName} deleted`);
        return true;
    }
    return false;
}

function addLogToItem(itemId, location, type) {
    const item = appState.items.find(i => i.id === itemId);
    if (!item) {
        showToast('Item not found');
        return false;
    }
    
    if (!location || location.trim() === '') {
        showToast('Please enter a location');
        return false;
    }
    
    item.addLog(location.trim(), type);
    
    updateStreak();
    updateDailyChallenge();
    addXP(XP_REWARDS.LOG_LOCATION, 'Logged location');
    checkAchievements();
    saveData();
    
    const message = type === 'stored' ? 'Location saved!' : 'Found location logged!';
    showToast(`${message} +${XP_REWARDS.LOG_LOCATION} XP`);
    return true;
}

// ============================================
// UI HELPERS
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    
    toastText.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

function getItemEmoji(name) {
    const lower = name.toLowerCase();
    
    if (lower.includes('key')) return '🔑';
    if (lower.includes('phone')) return '📱';
    if (lower.includes('wallet') || lower.includes('purse')) return '👛';
    if (lower.includes('remote')) return '📺';
    if (lower.includes('glasses') || lower.includes('sunglass')) return '👓';
    if (lower.includes('charger')) return '🔌';
    if (lower.includes('headphone') || lower.includes('earbud') || lower.includes('airpod')) return '🎧';
    if (lower.includes('watch')) return '⌚';
    if (lower.includes('ring')) return '💍';
    if (lower.includes('passport')) return '🛂';
    if (lower.includes('card') || lower.includes('credit')) return '💳';
    if (lower.includes('pen')) return '🖊️';
    if (lower.includes('notebook') || lower.includes('book')) return '📓';
    if (lower.includes('umbrella')) return '☂️';
    if (lower.includes('bag') || lower.includes('backpack')) return '🎒';
    if (lower.includes('shoe')) return '👟';
    if (lower.includes('hat') || lower.includes('cap')) return '🧢';
    
    return '📦';
}

function getCommonLocations() {
    return [
        'Kitchen drawer',
        'Bedroom',
        'Living room',
        'Bathroom',
        'Office desk',
        'Car',
        'Coat pocket',
        'Bag',
        'Under couch',
        'Nightstand'
    ];
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {
    appState.darkMode = !appState.darkMode;
    
    if (appState.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    saveTheme();
}

// ============================================
// DATA MANAGEMENT
// ============================================
function exportData() {
    const data = {
        version: '4.0',
        exportDate: new Date().toISOString(),
        items: appState.items,
        progress: {
            xp: appState.xp,
            level: appState.level,
            streak: appState.streak,
            longestStreak: appState.longestStreak,
            achievements: appState.achievements
        }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `unearth-backup-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Data exported!');
}

function clearAllData() {
    if (confirm('Delete ALL items and logs? Progress will be kept. This cannot be undone.')) {
        appState.items = [];
        saveData();
        showToast('All data cleared');
        switchScreen('home');
    }
}

function resetProgress() {
    if (confirm('Reset ALL progress? This will erase your level, XP, achievements, and streak. This cannot be undone.')) {
        appState.xp = 0;
        appState.level = 1;
        appState.streak = 0;
        appState.longestStreak = 0;
        appState.achievements = [];
        appState.dailyChallenge = { target: 3, current: 0, completed: false, date: null };
        saveProgress();
        showToast('Progress reset');
        switchScreen('home');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    document.getElementById('themeToggle')?.addEventListener('click', toggleDarkMode);
    
    document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            switchScreen(btn.dataset.screen);
        });
    });
    
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        showModal('addItemModal');
    });
    
    document.getElementById('addFirstItem')?.addEventListener('click', () => {
        showModal('addItemModal');
    });
    
    document.getElementById('saveItemBtn')?.addEventListener('click', () => {
        const input = document.getElementById('itemNameInput');
        if (addItem(input.value)) {
            hideModal('addItemModal');
            renderHome();
        }
    });
    
    document.getElementById('cancelAddBtn')?.addEventListener('click', () => {
        hideModal('addItemModal');
    });
    
    document.getElementById('itemNameInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveItemBtn')?.click();
        }
    });
    
    document.getElementById('backBtn')?.addEventListener('click', () => {
        switchScreen('home');
    });
    
    document.getElementById('deleteItemBtn')?.addEventListener('click', () => {
        showModal('deleteModal');
    });
    
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        if (appState.currentItemId && deleteItem(appState.currentItemId)) {
            hideModal('deleteModal');
            switchScreen('home');
        }
    });
    
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
        hideModal('deleteModal');
    });
    
    document.getElementById('foundItBtn')?.addEventListener('click', () => {
        appState.currentLogType = 'found';
        document.getElementById('logModalTitle').textContent = 'Where did you find it?';
        document.getElementById('logModalSubtitle').textContent = 'Log where you found this item';
        setupQuickLocations();
        showModal('logLocationModal');
    });
    
    document.getElementById('storedItBtn')?.addEventListener('click', () => {
        appState.currentLogType = 'stored';
        document.getElementById('logModalTitle').textContent = 'Where did you put it?';
        document.getElementById('logModalSubtitle').textContent = 'Remember this safe place';
        setupQuickLocations();
        showModal('logLocationModal');
    });
    
    document.getElementById('saveLogBtn')?.addEventListener('click', () => {
        const input = document.getElementById('locationInput');
        if (appState.currentItemId && addLogToItem(appState.currentItemId, input.value, appState.currentLogType)) {
            hideModal('logLocationModal');
            renderItemDetail(appState.currentItemId);
        }
    });
    
    document.getElementById('cancelLogBtn')?.addEventListener('click', () => {
        hideModal('logLocationModal');
    });
    
    document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveLogBtn')?.click();
        }
    });
    
    document.getElementById('closeLevelUpBtn')?.addEventListener('click', () => {
        hideModal('levelUpModal');
    });
    
    document.getElementById('closeAchievementBtn')?.addEventListener('click', () => {
        hideModal('achievementModal');
    });
    
    document.getElementById('moreBtn')?.addEventListener('click', () => {
        showModal('moreModal');
    });
    
    document.getElementById('closeMoreBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
    });
    
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
        exportData();
        hideModal('moreModal');
    });
    
    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
        clearAllData();
    });
    
    document.getElementById('resetProgressBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
        resetProgress();
    });
    
    document.getElementById('aboutBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
        showToast('Unearth v4.0 - Gamified Experience');
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    });
}

function setupQuickLocations() {
    const quickLocations = document.getElementById('quickLocations');
    const item = appState.items.find(i => i.id === appState.currentItemId);
    
    if (!item) return;
    
    const topLocs = item.getTopLocations(3);
    const commonLocs = getCommonLocations().slice(0, 4);
    
    const suggestions = new Set();
    topLocs.forEach(([loc]) => suggestions.add(loc));
    commonLocs.forEach(loc => suggestions.add(loc));
    
    quickLocations.innerHTML = Array.from(suggestions).slice(0, 6).map(loc => `
        <button class="quick-location" data-location="${escapeHtml(loc)}">
            ${escapeHtml(loc)}
        </button>
    `).join('');
    
    quickLocations.querySelectorAll('.quick-location').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('locationInput').value = btn.dataset.location;
        });
    });
}

// ============================================
// SERVICE WORKER
// ============================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('SW registered:', reg))
            .catch(err => console.error('SW registration failed:', err));
    }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('🎯 Unearth initializing...');
    
    loadData();
    loadTheme();
    registerServiceWorker();
    initEventListeners();
    
    switchScreen('home');
    
    console.log('✅ Unearth ready!');
}

// Start app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
