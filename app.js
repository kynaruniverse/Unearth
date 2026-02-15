// ============================================
// UNEARTH APP - REDESIGNED
// Track lost items & remember safe places
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================
let appState = {
    items: [],
    currentItemId: null,
    currentScreen: 'home',
    darkMode: false,
    currentLogType: null // 'found' or 'stored'
};

// ============================================
// STORAGE
// ============================================
const STORAGE_KEY = 'unearth_data_v3';
const THEME_KEY = 'unearth_theme';

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.items));
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
    } catch (e) {
        console.error('Failed to load:', e);
        appState.items = [];
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
        this.logs = []; // Array of {timestamp, location, type: 'found'|'stored'}
    }

    addLog(location, type = 'found') {
        this.logs.push({
            timestamp: Date.now(),
            location: location,
            type: type // 'found' or 'stored'
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
        // Get most recent "stored" log, or most recent log if no stored
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
// BADGES/ACHIEVEMENTS
// ============================================
const BADGES = [
    {
        id: 'first_item',
        name: 'Getting Started',
        icon: '🎯',
        condition: () => appState.items.length >= 1
    },
    {
        id: 'first_log',
        name: 'First Log',
        icon: '📝',
        condition: () => getTotalLogs() >= 1
    },
    {
        id: 'five_items',
        name: 'Collector',
        icon: '📦',
        condition: () => appState.items.length >= 5
    },
    {
        id: 'ten_logs',
        name: 'Pattern Builder',
        icon: '🧠',
        condition: () => getTotalLogs() >= 10
    },
    {
        id: 'organized',
        name: 'Organized',
        icon: '⭐',
        condition: () => {
            // Has at least one stored location
            return appState.items.some(item => 
                item.logs.some(log => log.type === 'stored')
            );
        }
    },
    {
        id: 'consistent',
        name: 'Consistent',
        icon: '🔄',
        condition: () => {
            // Same location logged 5+ times
            return appState.items.some(item => {
                const freq = item.getLocationFrequency();
                return Object.values(freq).some(count => count >= 5);
            });
        }
    }
];

function getEarnedBadges() {
    return BADGES.filter(badge => badge.condition());
}

// ============================================
// UI RENDERING
// ============================================

function renderHome() {
    // Update quick stats
    document.getElementById('totalItems').textContent = appState.items.length;
    document.getElementById('totalLogs').textContent = getTotalLogs();
    
    // Render items list
    const itemsList = document.getElementById('itemsList');
    const emptyState = document.getElementById('emptyState');
    
    if (appState.items.length === 0) {
        itemsList.innerHTML = '';
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        
        // Sort by most recent activity
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
        
        // Add click handlers
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
    
    // Set title
    document.getElementById('detailTitle').textContent = item.name;
    
    // Render common locations
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
        
        // Add click handlers to chips
        commonLocations.querySelectorAll('.location-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const location = chip.dataset.location;
                document.getElementById('locationInput').value = location;
                showModal('logLocationModal');
            });
        });
    }
    
    // Render history
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

function renderStats() {
    // Update main stats
    document.getElementById('statsTotal').textContent = getTotalLogs();
    
    const mostLogged = getMostLoggedItem();
    document.getElementById('statsMostLogged').textContent = 
        mostLogged ? escapeHtml(mostLogged.name) : '—';
    
    const topLoc = getTopLocation();
    document.getElementById('statsTopLocation').textContent = 
        topLoc ? escapeHtml(topLoc) : '—';
    
    // Render achievements
    const achievementsList = document.getElementById('achievementsList');
    const earnedBadges = getEarnedBadges();
    
    achievementsList.innerHTML = BADGES.map(badge => {
        const earned = earnedBadges.some(b => b.id === badge.id);
        return `
            <div class="achievement ${earned ? 'earned' : ''}">
                <div class="achievement-icon">${badge.icon}</div>
                <div class="achievement-name">${badge.name}</div>
            </div>
        `;
    }).join('');
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
        
        // Update nav
        document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.nav-btn[data-screen="${screenName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Render screen
        switch(screenName) {
            case 'home':
                renderHome();
                break;
            case 'stats':
                renderStats();
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

// ============================================
// ITEM MANAGEMENT
// ============================================
function addItem(name) {
    if (!name || name.trim() === '') {
        showToast('Please enter an item name');
        return false;
    }
    
    const trimmedName = name.trim();
    
    // Check duplicates
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
    saveData();
    
    const message = type === 'stored' ? 'Location saved!' : 'Found location logged!';
    showToast(message);
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

// Get common location suggestions
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
        version: '3.0',
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
    if (confirm('Delete ALL items and logs? This cannot be undone.')) {
        appState.items = [];
        saveData();
        showToast('All data cleared');
        switchScreen('home');
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
            switchScreen(btn.dataset.screen);
        });
    });
    
    // Add item buttons
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        showModal('addItemModal');
    });
    
    document.getElementById('addFirstItem')?.addEventListener('click', () => {
        showModal('addItemModal');
    });
    
    // Add item modal
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
    
    // Detail screen - back
    document.getElementById('backBtn')?.addEventListener('click', () => {
        switchScreen('home');
    });
    
    // Detail screen - delete
    document.getElementById('deleteItemBtn')?.addEventListener('click', () => {
        showModal('deleteModal');
    });
    
    // Delete modal
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        if (appState.currentItemId && deleteItem(appState.currentItemId)) {
            hideModal('deleteModal');
            switchScreen('home');
        }
    });
    
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
        hideModal('deleteModal');
    });
    
    // Action buttons - Found It
    document.getElementById('foundItBtn')?.addEventListener('click', () => {
        appState.currentLogType = 'found';
        document.getElementById('logModalTitle').textContent = 'Where did you find it?';
        document.getElementById('logModalSubtitle').textContent = 'Log where you found this item';
        setupQuickLocations();
        showModal('logLocationModal');
    });
    
    // Action buttons - Stored It
    document.getElementById('storedItBtn')?.addEventListener('click', () => {
        appState.currentLogType = 'stored';
        document.getElementById('logModalTitle').textContent = 'Where did you put it?';
        document.getElementById('logModalSubtitle').textContent = 'Remember this safe place';
        setupQuickLocations();
        showModal('logLocationModal');
    });
    
    // Log location modal
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
    
    // More button
    document.getElementById('moreBtn')?.addEventListener('click', () => {
        showModal('moreModal');
    });
    
    document.getElementById('closeMoreBtn')?.addEventListener('click', () => {
        hideModal('moreModal');
    });
    
    // More options
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
        showToast('Unearth v3.0 - Never forget where you put things');
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

// Setup quick location suggestions
function setupQuickLocations() {
    const quickLocations = document.getElementById('quickLocations');
    const item = appState.items.find(i => i.id === appState.currentItemId);
    
    if (!item) return;
    
    const topLocs = item.getTopLocations(3);
    const commonLocs = getCommonLocations().slice(0, 4);
    
    // Combine item's top locations with common suggestions
    const suggestions = new Set();
    topLocs.forEach(([loc]) => suggestions.add(loc));
    commonLocs.forEach(loc => suggestions.add(loc));
    
    quickLocations.innerHTML = Array.from(suggestions).slice(0, 6).map(loc => `
        <button class="quick-location" data-location="${escapeHtml(loc)}">
            ${escapeHtml(loc)}
        </button>
    `).join('');
    
    // Add click handlers
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
// URL PARAMS
// ============================================
function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action === 'add') {
        showModal('addItemModal');
    } else if (action === 'stats') {
        switchScreen('stats');
    }
    
    if (action) {
        window.history.replaceState({}, document.title, '/');
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
    handleURLParams();
    
    switchScreen('home');
    
    console.log('✅ Unearth ready!');
}

// Start app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
