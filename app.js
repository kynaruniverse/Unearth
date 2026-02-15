// ============================================
// UNEARTH APP.JS - Pattern-Driven Chaos Companion
// Progressive Web App - 2026
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================
let appState = {
    items: [],
    currentItemId: null,
    currentScreen: 'dashboard',
    darkMode: false
};

// ============================================
// LOCALSTORAGE HELPERS
// ============================================
const STORAGE_KEY = 'unearth_data_v2';
const THEME_KEY = 'unearth_theme';

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.items));
    } catch (e) {
        console.error('Failed to save data:', e);
        showToast('Failed to save data');
    }
}

function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            appState.items = JSON.parse(data);
        }
    } catch (e) {
        console.error('Failed to load data:', e);
        appState.items = [];
    }
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark') {
            appState.darkMode = true;
            document.body.classList.add('dark-mode');
        } else {
            appState.darkMode = false;
            document.body.classList.remove('dark-mode');
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
        this.logs = []; // Array of {timestamp, location}
    }

    addLog(location) {
        this.logs.push({
            timestamp: Date.now(),
            location: location
        });
    }

    getTotalLosses() {
        return this.logs.length;
    }

    getLocationFrequency() {
        const freq = {};
        this.logs.forEach(log => {
            freq[log.location] = (freq[log.location] || 0) + 1;
        });
        return freq;
    }

    getTopLocations(limit = 3) {
        const freq = this.getLocationFrequency();
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    getRecentLogs(limit = 5) {
        return [...this.logs]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
}

// ============================================
// STATISTICS & INSIGHTS
// ============================================
function getTotalLosses() {
    return appState.items.reduce((sum, item) => sum + item.getTotalLosses(), 0);
}

function getMostLostItem() {
    if (appState.items.length === 0) return null;
    return appState.items.reduce((max, item) => 
        item.getTotalLosses() > (max?.getTotalLosses() || 0) ? item : max
    , null);
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

function generateInsight() {
    const totalLosses = getTotalLosses();
    const itemCount = appState.items.length;
    const mostLost = getMostLostItem();
    const topLoc = getTopLocation();

    if (totalLosses === 0) {
        return "🎯 Start tracking to unlock patterns";
    }

    if (totalLosses === 1) {
        return "🌱 First chaos event logged! Keep tracking to see patterns emerge";
    }

    if (totalLosses < 5) {
        return `📊 ${totalLosses} events tracked. Patterns are forming...`;
    }

    if (mostLost && topLoc) {
        return `🔍 Your ${mostLost.name} loves hiding in ${topLoc}`;
    }

    if (mostLost) {
        return `👑 ${mostLost.name} is your most chaotic item`;
    }

    const avgLosses = Math.round(totalLosses / itemCount);
    return `📈 Average ${avgLosses} losses per item. You're building a chaos database!`;
}

// ============================================
// BADGES/ACHIEVEMENTS SYSTEM
// ============================================
const BADGES = [
    {
        id: 'first_track',
        name: 'First Step',
        icon: '🎯',
        condition: () => getTotalLosses() >= 1
    },
    {
        id: 'five_items',
        name: 'Collector',
        icon: '📦',
        condition: () => appState.items.length >= 5
    },
    {
        id: 'ten_losses',
        name: 'Chaos Novice',
        icon: '😅',
        condition: () => getTotalLosses() >= 10
    },
    {
        id: 'fifty_losses',
        name: 'Pattern Master',
        icon: '🧠',
        condition: () => getTotalLosses() >= 50
    },
    {
        id: 'same_spot',
        name: 'Creature of Habit',
        icon: '🔄',
        condition: () => {
            return appState.items.some(item => {
                const freq = item.getLocationFrequency();
                return Object.values(freq).some(count => count >= 5);
            });
        }
    },
    {
        id: 'three_items',
        name: 'Getting Started',
        icon: '🌟',
        condition: () => appState.items.length >= 3
    }
];

function getEarnedBadges() {
    return BADGES.filter(badge => badge.condition());
}

// ============================================
// UI RENDERING
// ============================================

function renderDashboard() {
    // Update hero number
    document.getElementById('heroTotalLosses').textContent = getTotalLosses();
    
    // Update insight
    const insightCard = document.getElementById('todayInsight');
    insightCard.querySelector('.insight-text').textContent = generateInsight();
    
    // Render recent items (max 5)
    const itemsList = document.getElementById('dashboardItemsList');
    const emptyState = document.getElementById('dashboardEmpty');
    
    if (appState.items.length === 0) {
        itemsList.innerHTML = '';
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        const recentItems = [...appState.items]
            .sort((a, b) => {
                const aLatest = a.logs[a.logs.length - 1]?.timestamp || a.createdAt;
                const bLatest = b.logs[b.logs.length - 1]?.timestamp || b.createdAt;
                return bLatest - aLatest;
            })
            .slice(0, 5);
        
        itemsList.innerHTML = recentItems.map(item => `
            <div class="dashboard-item-card card-3d" data-item-id="${item.id}">
                <div class="card-shine"></div>
                <div class="dashboard-item-info">
                    <div class="dashboard-item-name">${escapeHtml(item.name)}</div>
                    <div class="dashboard-item-stat">Lost ${item.getTotalLosses()} time${item.getTotalLosses() !== 1 ? 's' : ''}</div>
                </div>
                <div class="dashboard-item-arrow">→</div>
            </div>
        `).join('');
        
        // Add click handlers
        itemsList.querySelectorAll('.dashboard-item-card').forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.dataset.itemId;
                showItemDetail(itemId);
            });
        });
    }
}

function renderItemsScreen() {
    const itemsList = document.getElementById('itemsList');
    const emptyState = document.getElementById('emptyState');
    const itemsCount = document.getElementById('itemsCount');
    
    itemsCount.textContent = `${appState.items.length} item${appState.items.length !== 1 ? 's' : ''}`;
    
    if (appState.items.length === 0) {
        itemsList.classList.add('hidden');
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        itemsList.classList.remove('hidden');
        
        itemsList.innerHTML = appState.items.map((item, index) => `
            <div class="item-card-grid-ultimate card-3d" data-item-id="${item.id}" style="animation-delay: ${index * 0.1}s">
                <div class="card-shine"></div>
                <div class="item-icon-ultimate">
                    ${getItemEmoji(item.name)}
                </div>
                <div class="item-card-name">${escapeHtml(item.name)}</div>
                <div class="item-card-count">${item.getTotalLosses()} losses</div>
            </div>
        `).join('');
        
        // Add click handlers
        itemsList.querySelectorAll('.item-card-grid-ultimate').forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.dataset.itemId;
                showItemDetail(itemId);
            });
        });
    }
}

function renderStatsScreen() {
    // Total losses
    document.getElementById('totalLosses').textContent = getTotalLosses();
    
    // Most lost item
    const mostLost = getMostLostItem();
    document.getElementById('mostLostItem').textContent = mostLost ? escapeHtml(mostLost.name) : '—';
    
    // Top location
    const topLoc = getTopLocation();
    document.getElementById('topLocation').textContent = topLoc ? escapeHtml(topLoc) : '—';
    
    // Badges
    const badgesGrid = document.getElementById('badgesGrid');
    const earnedBadges = getEarnedBadges();
    
    badgesGrid.innerHTML = BADGES.map(badge => {
        const earned = earnedBadges.some(b => b.id === badge.id);
        return `
            <div class="badge-ultimate card-3d ${earned ? 'earned' : ''}">
                <div class="card-shine"></div>
                <span class="badge-icon">${badge.icon}</span>
                <div class="badge-name">${badge.name}</div>
            </div>
        `;
    }).join('');
}

function renderItemDetail(itemId) {
    const item = appState.items.find(i => i.id === itemId);
    if (!item) {
        showToast('Item not found');
        switchScreen('dashboard');
        return;
    }
    
    // Set title
    document.getElementById('itemDetailTitle').textContent = item.name;
    
    // Total lost count
    document.getElementById('detailTotalLost').textContent = item.getTotalLosses();
    
    // Predictions (top locations)
    const predictionsList = document.getElementById('predictionsList');
    const topLocations = item.getTopLocations(3);
    
    if (topLocations.length === 0) {
        predictionsList.innerHTML = '<div class="no-logs">No patterns yet. Log your first loss!</div>';
    } else {
        predictionsList.innerHTML = topLocations.map(([location, count], index) => `
            <div class="prediction-item-ultimate card-3d" style="animation-delay: ${index * 0.1}s">
                <div class="card-shine"></div>
                <div class="prediction-rank">${index + 1}</div>
                <div class="prediction-location">${escapeHtml(location)}</div>
                <div class="prediction-count">${count}×</div>
            </div>
        `).join('');
    }
    
    // Recent logs
    const logsList = document.getElementById('logsList');
    const recentLogs = item.getRecentLogs(5);
    
    if (recentLogs.length === 0) {
        logsList.innerHTML = '<div class="no-logs">No history yet</div>';
    } else {
        logsList.innerHTML = recentLogs.map((log, index) => `
            <div class="log-item-ultimate card-3d" style="animation-delay: ${index * 0.1}s">
                <div class="card-shine"></div>
                <div class="log-location">${escapeHtml(log.location)}</div>
                <div class="log-time">${formatTimeAgo(log.timestamp)}</div>
            </div>
        `).join('');
    }
}

// ============================================
// SCREEN NAVIGATION
// ============================================
function switchScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(`${screenName}Screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenName;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.nav-btn[data-screen="${screenName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Render screen content
        switch(screenName) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'items':
                renderItemsScreen();
                break;
            case 'stats':
                renderStatsScreen();
                break;
        }
    }
}

function showItemDetail(itemId) {
    appState.currentItemId = itemId;
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('itemDetailScreen').classList.add('active');
    renderItemDetail(itemId);
}

// ============================================
// MODALS
// ============================================
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Focus input if exists
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
        // Clear inputs
        modal.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
        });
    }
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
    
    // Check for duplicates
    if (appState.items.some(item => item.name.toLowerCase() === trimmedName.toLowerCase())) {
        showToast('Item already exists');
        return false;
    }
    
    const newItem = new Item(trimmedName);
    appState.items.push(newItem);
    saveData();
    
    showToast(`${trimmedName} added!`);
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

function addLogToItem(itemId, location) {
    const item = appState.items.find(i => i.id === itemId);
    if (!item) {
        showToast('Item not found');
        return false;
    }
    
    if (!location || location.trim() === '') {
        showToast('Please enter a location');
        return false;
    }
    
    item.addLog(location.trim());
    saveData();
    
    // Trigger confetti
    triggerConfetti();
    showToast('Pattern saved! 🎉');
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

function triggerConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#10b981'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3500);
    }
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
    const nameLower = name.toLowerCase();
    
    // Common items
    if (nameLower.includes('key')) return '🔑';
    if (nameLower.includes('phone')) return '📱';
    if (nameLower.includes('wallet')) return '👛';
    if (nameLower.includes('remote')) return '📺';
    if (nameLower.includes('glasses') || nameLower.includes('sunglass')) return '👓';
    if (nameLower.includes('charger')) return '🔌';
    if (nameLower.includes('headphone') || nameLower.includes('earbud')) return '🎧';
    if (nameLower.includes('pen')) return '🖊️';
    if (nameLower.includes('book')) return '📚';
    if (nameLower.includes('watch')) return '⌚';
    if (nameLower.includes('ring')) return '💍';
    if (nameLower.includes('shoe')) return '👟';
    if (nameLower.includes('sock')) return '🧦';
    if (nameLower.includes('hat') || nameLower.includes('cap')) return '🧢';
    if (nameLower.includes('umbrella')) return '☂️';
    if (nameLower.includes('bag') || nameLower.includes('backpack')) return '🎒';
    if (nameLower.includes('bottle')) return '🍾';
    if (nameLower.includes('cup') || nameLower.includes('mug')) return '☕';
    
    // Default
    return '📦';
}

// ============================================
// DARK MODE TOGGLE
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
        version: '2.0',
        exportDate: new Date().toISOString(),
        items: appState.items
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
    if (confirm('Are you sure? This will delete ALL your items and cannot be undone.')) {
        appState.items = [];
        saveData();
        showToast('All data cleared');
        switchScreen('dashboard');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleDarkMode);
    
    // Navigation
    document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            switchScreen(screen);
        });
    });
    
    // Add item buttons
    document.getElementById('tabAddBtn')?.addEventListener('click', () => {
        showModal('addItemModal');
    });
    
    document.getElementById('addItemQuick')?.addEventListener('click', () => {
        showModal('addItemModal');
    });
    
    // Add item modal
    document.getElementById('saveItemBtn')?.addEventListener('click', () => {
        const input = document.getElementById('itemNameInput');
        if (addItem(input.value)) {
            hideModal('addItemModal');
            switchScreen('items');
        }
    });
    
    document.getElementById('cancelAddBtn')?.addEventListener('click', () => {
        hideModal('addItemModal');
    });
    
    // Enter key in add item modal
    document.getElementById('itemNameInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveItemBtn')?.click();
        }
    });
    
    // Item detail - back button
    document.getElementById('backFromDetail')?.addEventListener('click', () => {
        switchScreen('dashboard');
    });
    
    // Item detail - delete button
    document.getElementById('deleteItemBtn')?.addEventListener('click', () => {
        showModal('deleteModal');
    });
    
    // Delete modal
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        if (appState.currentItemId && deleteItem(appState.currentItemId)) {
            hideModal('deleteModal');
            switchScreen('items');
        }
    });
    
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
        hideModal('deleteModal');
    });
    
    // Lost button (opens found modal)
    document.getElementById('lostBtn')?.addEventListener('click', () => {
        showModal('foundModal');
    });
    
    // Found modal
    document.getElementById('saveFoundBtn')?.addEventListener('click', () => {
        const input = document.getElementById('locationInput');
        if (appState.currentItemId && addLogToItem(appState.currentItemId, input.value)) {
            hideModal('foundModal');
            renderItemDetail(appState.currentItemId);
        }
    });
    
    document.getElementById('cancelFoundBtn')?.addEventListener('click', () => {
        hideModal('foundModal');
    });
    
    // Enter key in found modal
    document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveFoundBtn')?.click();
        }
    });
    
    // More button
    document.getElementById('moreBtn')?.addEventListener('click', () => {
        showModal('moreModal');
    });
    
    document.getElementById('closeMoreBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
    });
    
    // More modal options
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
        exportData();
        hideModal('moreModal');
    });
    
    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
        clearAllData();
    });
    
    document.getElementById('aboutBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
        showToast('Unearth v2.0 - Pattern-Driven Chaos Companion');
    });
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    });
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

// ============================================
// URL PARAMS (for PWA shortcuts)
// ============================================
function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action === 'add') {
        showModal('addItemModal');
    } else if (action === 'stats') {
        switchScreen('stats');
    }
    
    // Clear URL params
    if (action) {
        window.history.replaceState({}, document.title, '/');
    }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('🎯 Unearth initializing...');
    
    // Load saved data
    loadData();
    loadTheme();
    
    // Register service worker
    registerServiceWorker();
    
    // Initialize event listeners
    initEventListeners();
    
    // Handle URL params (PWA shortcuts)
    handleURLParams();
    
    // Render initial screen
    switchScreen('dashboard');
    
    console.log('✅ Unearth ready!');
}

// ============================================
// START APP
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
