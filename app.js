// ===========================================
// UNEARTH ENHANCED - FULL APPLICATION LOGIC
// Bottom Tabs + Dashboard + All Features
// ===========================================

// ===========================================
// CONTEXTUAL PREDICTION ENGINE
// ===========================================

const getContextualAdvice = (item) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay(); 
    const todayName = days[todayIndex];
    const history = item.logs || [];
    
    const daySpecificLogs = history.filter(log => log.foundAt && new Date(log.foundAt).getDay() === todayIndex);
    
    if (daySpecificLogs.length > 0) {
        const counts = {};
        daySpecificLogs.forEach(l => {
            if(l.location) counts[l.location] = (counts[l.location] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
        if (sorted.length > 0) {
            return `Usually in the ${sorted[0][0]} on ${todayName}s`;
        }
    }
    
    const topLocations = getTopPredictions(item, 1);
    if (topLocations.length > 0) {
        return `Most often at: ${topLocations[0].location}`;
    }
    
    return "No patterns yet";
};

// Application State
const AppState = {
    currentScreen: 'dashboard',
    currentItem: null,
    data: {
        items: {}
    }
};

// Badge Definitions
const BADGES = [
    { id: 'first_loss', name: 'First Loss', icon: '🎯', requirement: 1 },
    { id: 'detective', name: 'Detective', icon: '🔍', requirement: 10 },
    { id: 'chaos_master', name: 'Chaos Master', icon: '😅', requirement: 50 },
    { id: 'pattern_finder', name: 'Pattern Finder', icon: '🧠', requirement: 100 }
];

// ===========================================
// INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
    render();
    registerServiceWorker();
});

// ===========================================
// DATA MANAGEMENT
// ===========================================

function loadData() {
    try {
        const stored = localStorage.getItem('unearthData');
        if (stored) {
            AppState.data = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data');
    }
}

function saveData() {
    try {
        localStorage.setItem('unearthData', JSON.stringify(AppState.data));
    } catch (error) {
        console.error('Error saving data:', error);
        showToast('Error saving data');
    }
}

// ===========================================
// EVENT LISTENERS
// ===========================================

function initializeEventListeners() {
    // Bottom Tab Navigation
    document.querySelectorAll('.tab-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            showScreen(screen);
            updateActiveTab(screen);
        });
    });
    
    // Tab Add Button
    document.getElementById('tabAddBtn').addEventListener('click', openAddItemModal);
    
    // Quick Add Button (Dashboard)
    const quickAddBtn = document.getElementById('addItemQuick');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', openAddItemModal);
    }
    
    // More Button
    document.getElementById('moreBtn').addEventListener('click', openMoreModal);
    document.getElementById('closeMoreBtn').addEventListener('click', closeMoreModal);
    
    // More Menu Options
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('clearAllBtn').addEventListener('click', confirmClearAll);
    document.getElementById('aboutBtn').addEventListener('click', showAbout);
    
    // Add Item Modal
    document.getElementById('cancelAddBtn').addEventListener('click', closeAddItemModal);
    document.getElementById('saveItemBtn').addEventListener('click', saveNewItem);
    
    // Found Location Modal
    document.getElementById('cancelFoundBtn').addEventListener('click', closeFoundModal);
    document.getElementById('saveFoundBtn').addEventListener('click', saveFoundLocation);
    
    // Delete Confirmation Modal
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const addModal = document.getElementById('addItemModal');
            const foundModal = document.getElementById('foundModal');
            
            if (!addModal.classList.contains('hidden')) {
                saveNewItem();
            } else if (!foundModal.classList.contains('hidden')) {
                saveFoundLocation();
            }
        }
    });
}

// ===========================================
// SCREEN NAVIGATION
// ===========================================

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screens = {
        'dashboard': 'dashboardScreen',
        'items': 'itemsScreen',
        'stats': 'statsScreen',
        'detail': 'itemDetailScreen'
    };
    
    const screenId = screens[screenName];
    if (screenId) {
        document.getElementById(screenId).classList.add('active');
    }
    
    AppState.currentScreen = screenName;
    
    // Render appropriate content
    if (screenName === 'dashboard') {
        renderDashboard();
    } else if (screenName === 'items') {
        renderItemsGrid();
    } else if (screenName === 'stats') {
        renderStats();
    } else if (screenName === 'detail') {
        renderItemDetail();
    }
}

function updateActiveTab(screenName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.tab-btn[data-screen="${screenName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// ===========================================
// DASHBOARD RENDERING
// ===========================================

function renderDashboard() {
    const items = Object.keys(AppState.data.items);
    const totalLosses = calculateTotalLosses();
    
    // Update hero stat
    document.getElementById('heroTotalLosses').textContent = totalLosses;
    
    // Update insight
    updateTodayInsight();
    
    // Render dashboard items list
    const dashboardList = document.getElementById('dashboardItemsList');
    const dashboardEmpty = document.getElementById('dashboardEmpty');
    
    if (items.length === 0) {
        dashboardList.innerHTML = '';
        dashboardEmpty.style.display = 'flex';
    } else {
        dashboardEmpty.style.display = 'none';
        dashboardList.innerHTML = items.slice(0, 5).map(itemName => {
            const item = AppState.data.items[itemName];
            const advice = getContextualAdvice(item);
            return `
                <div class="dashboard-item-card neo-card" onclick="openItemDetailFromDashboard('${itemName}')">
                    <div class="dashboard-item-info">
                        <div class="dashboard-item-name">${itemName}</div>
                        <div class="dashboard-item-stat">${advice}</div>
                    </div>
                    <div class="dashboard-item-arrow">→</div>
                </div>
            `;
        }).join('');
    }
}

function updateTodayInsight() {
    const items = Object.keys(AppState.data.items);
    const insightCard = document.getElementById('todayInsight');
    
    if (items.length === 0) {
        insightCard.innerHTML = `
            <div class="insight-icon">💡</div>
            <div class="insight-text">Start tracking to unlock patterns</div>
        `;
        return;
    }
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    
    // Find items with day-specific patterns for today
    let bestMatch = null;
    let bestCount = 0;
    
    items.forEach(itemName => {
        const item = AppState.data.items[itemName];
        const todayLogs = (item.logs || []).filter(log => 
            log.foundAt && new Date(log.foundAt).getDay() === new Date().getDay()
        );
        
        if (todayLogs.length > bestCount) {
            bestCount = todayLogs.length;
            bestMatch = itemName;
        }
    });
    
    if (bestMatch && bestCount > 1) {
        insightCard.innerHTML = `
            <div class="insight-icon">⚡</div>
            <div class="insight-text">You often lose ${bestMatch} on ${todayName}s - stay alert!</div>
        `;
    } else {
        const totalLosses = calculateTotalLosses();
        if (totalLosses > 20) {
            insightCard.innerHTML = `
                <div class="insight-icon">🎯</div>
                <div class="insight-text">You've logged ${totalLosses} losses - patterns are emerging!</div>
            `;
        } else {
            insightCard.innerHTML = `
                <div class="insight-icon">💡</div>
                <div class="insight-text">Keep tracking to discover your chaos patterns</div>
            `;
        }
    }
}

function openItemDetailFromDashboard(itemName) {
    AppState.currentItem = itemName;
    showScreen('detail');
    // Don't update tabs - stay on dashboard tab visually
}

// ===========================================
// ITEMS GRID RENDERING
// ===========================================

function renderItemsGrid() {
    const itemsList = document.getElementById('itemsList');
    const emptyState = document.getElementById('emptyState');
    const items = Object.keys(AppState.data.items);
    
    if (items.length === 0) {
        emptyState.style.display = 'flex';
        itemsList.classList.add('hidden');
        return;
    }
    
    emptyState.style.display = 'none';
    itemsList.classList.remove('hidden');
    
    // Generate emoji for each item (simple hash-based selection)
    const emojis = ['🔑', '💼', '📱', '👓', '🎒', '⌚', '🎧', '💳', '📔', '🔌'];
    
    itemsList.innerHTML = items.map(itemName => {
        const item = AppState.data.items[itemName];
        const emojiIndex = itemName.length % emojis.length;
        const emoji = emojis[emojiIndex];
        
        return `
            <div class="item-card-grid neo-card" onclick="openItemDetail('${itemName}')">
                <div class="item-emoji">${emoji}</div>
                <div class="item-card-name">${itemName}</div>
                <div class="item-card-count">Lost ${item.totalLost}x</div>
            </div>
        `;
    }).join('');
}

// ===========================================
// ITEM MANAGEMENT
// ===========================================

function openAddItemModal() {
    document.getElementById('addItemModal').classList.remove('hidden');
    document.getElementById('itemNameInput').value = '';
    setTimeout(() => document.getElementById('itemNameInput').focus(), 100);
}

function closeAddItemModal() {
    document.getElementById('addItemModal').classList.add('hidden');
}

function saveNewItem() {
    const input = document.getElementById('itemNameInput');
    const itemName = input.value.trim();
    
    if (!itemName) {
        showToast('Please enter an item name');
        return;
    }
    
    if (AppState.data.items[itemName]) {
        showToast('Item already exists');
        return;
    }
    
    AppState.data.items[itemName] = {
        totalLost: 0,
        locations: {},
        logs: []
    };
    
    saveData();
    closeAddItemModal();
    render();
    showToast(`${itemName} added ✨`);
}

function openItemDetail(itemName) {
    AppState.currentItem = itemName;
    showScreen('detail');
    updateActiveTab('items'); // Keep items tab active
}

function handleLostItem() {
    if (!AppState.currentItem) return;
    
    const item = AppState.data.items[AppState.currentItem];
    item.totalLost++;
    
    const log = {
        lostAt: new Date().toISOString(),
        foundAt: null,
        location: null
    };
    item.logs.unshift(log);
    
    saveData();
    showToast('Logged as lost 😅');
    openFoundModal();
}

function openFoundModal() {
    document.getElementById('foundModal').classList.remove('hidden');
    document.getElementById('locationInput').value = '';
    setTimeout(() => document.getElementById('locationInput').focus(), 100);
}

function closeFoundModal() {
    document.getElementById('foundModal').classList.add('hidden');
}

function saveFoundLocation() {
    const location = document.getElementById('locationInput').value.trim();
    
    if (!location) {
        showToast('Please enter a location');
        return;
    }
    
    const item = AppState.data.items[AppState.currentItem];
    
    if (item.logs.length > 0) {
        item.logs[0].foundAt = new Date().toISOString();
        item.logs[0].location = location;
    }
    
    if (!item.locations[location]) {
        item.locations[location] = 0;
    }
    item.locations[location]++;
    
    saveData();
    closeFoundModal();
    renderItemDetail();
    showToast(`Found at ${location} 🎉`);
}

function openDeleteModal() {
    document.getElementById('deleteModal').classList.remove('hidden');
    
    // Attach button listeners
    document.getElementById('confirmDeleteBtn').onclick = confirmDelete;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

function confirmDelete() {
    if (!AppState.currentItem) return;
    
    delete AppState.data.items[AppState.currentItem];
    saveData();
    closeDeleteModal();
    showScreen('dashboard');
    updateActiveTab('dashboard');
    showToast('Item deleted');
}

// ===========================================
// ITEM DETAIL RENDERING
// ===========================================

function renderItemDetail() {
    if (!AppState.currentItem) return;
    
    const item = AppState.data.items[AppState.currentItem];
    
    // Attach back button listener
    document.getElementById('backFromDetail').onclick = () => {
        showScreen('items');
        updateActiveTab('items');
    };
    
    // Attach delete button listener
    document.getElementById('deleteItemBtn').onclick = openDeleteModal;
    
    // Attach lost button listener
    document.getElementById('lostBtn').onclick = handleLostItem;
    
    // Update title
    document.getElementById('itemDetailTitle').textContent = AppState.currentItem;
    
    // Update stats
    document.getElementById('detailTotalLost').textContent = item.totalLost;
    
    // Render predictions
    const predictions = getTopPredictions(item, 5);
    const predictionsList = document.getElementById('predictionsList');
    
    if (predictions.length === 0) {
        predictionsList.innerHTML = '<div class="no-logs">No predictions yet. Log some losses first!</div>';
    } else {
        predictionsList.innerHTML = predictions.map((pred, idx) => `
            <div class="prediction-item-neo neo-card">
                <div class="prediction-left">
                    <div class="prediction-rank-neo">${idx + 1}</div>
                    <div class="prediction-location-neo">${pred.location}</div>
                </div>
                <div class="prediction-count-neo">${pred.count}x</div>
            </div>
        `).join('');
    }
    
    // Render logs
    const logsList = document.getElementById('logsList');
    const recentLogs = item.logs.slice(0, 10);
    
    if (recentLogs.length === 0) {
        logsList.innerHTML = '<div class="no-logs">No history yet</div>';
    } else {
        logsList.innerHTML = recentLogs.map(log => `
            <div class="log-item-neo neo-card">
                <div class="log-location-neo">${log.location || 'Lost (not found yet)'}</div>
                <div class="log-time-neo">${formatDate(log.lostAt)}</div>
            </div>
        `).join('');
    }
}

// ===========================================
// STATS RENDERING
// ===========================================

function renderStats() {
    let totalLosses = 0;
    let mostLostItem = null;
    let maxLosses = 0;
    const allLocations = {};
    
    Object.keys(AppState.data.items).forEach(itemName => {
        const item = AppState.data.items[itemName];
        totalLosses += item.totalLost;
        
        if (item.totalLost > maxLosses) {
            maxLosses = item.totalLost;
            mostLostItem = itemName;
        }
        
        Object.keys(item.locations).forEach(loc => {
            if (!allLocations[loc]) allLocations[loc] = 0;
            allLocations[loc] += item.locations[loc];
        });
    });
    
    document.getElementById('totalLosses').textContent = totalLosses;
    document.getElementById('mostLostItem').textContent = mostLostItem || '—';
    
    let topLocation = '—';
    let maxCount = 0;
    Object.keys(allLocations).forEach(loc => {
        if (allLocations[loc] > maxCount) {
            maxCount = allLocations[loc];
            topLocation = loc;
        }
    });
    document.getElementById('topLocation').textContent = topLocation;
    
    // Render badges
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = BADGES.map(badge => {
        const earned = totalLosses >= badge.requirement;
        return `
            <div class="badge-neo neo-card ${earned ? 'earned' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `;
    }).join('');
}

// ===========================================
// MORE MENU
// ===========================================

function openMoreModal() {
    document.getElementById('moreModal').classList.remove('hidden');
}

function closeMoreModal() {
    document.getElementById('moreModal').classList.add('hidden');
}

function exportData() {
    const dataStr = JSON.stringify(AppState.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unearth-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    closeMoreModal();
    showToast('Data exported! 💾');
}

function confirmClearAll() {
    if (confirm('⚠️ This will delete ALL your data. Are you sure?')) {
        AppState.data = { items: {} };
        saveData();
        closeMoreModal();
        render();
        showToast('All data cleared');
    }
}

function showAbout() {
    alert(`Unearth v2.0
    
Pattern-Driven Chaos Companion

Built with ❤️ for the chronically disorganized.

Your data stays private - stored only on your device.

GitHub: github.com/yourusername/unearth`);
}

// ===========================================
// PREDICTION LOGIC
// ===========================================

function getTopPredictions(item, limit = 3) {
    const locations = item.locations;
    const predictions = Object.keys(locations).map(location => ({
        location,
        count: locations[location]
    }));
    
    predictions.sort((a, b) => b.count - a.count);
    return predictions.slice(0, limit);
}

// ===========================================
// UTILITIES
// ===========================================

function calculateTotalLosses() {
    let total = 0;
    Object.keys(AppState.data.items).forEach(itemName => {
        total += AppState.data.items[itemName].totalLost;
    });
    return total;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
}

function render() {
    if (AppState.currentScreen === 'dashboard') {
        renderDashboard();
    } else if (AppState.currentScreen === 'items') {
        renderItemsGrid();
    } else if (AppState.currentScreen === 'stats') {
        renderStats();
    } else if (AppState.currentScreen === 'detail') {
        renderItemDetail();
    }
}

// ===========================================
// SERVICE WORKER REGISTRATION
// ===========================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.log('❌ Service Worker registration failed:', err));
    }
}

// ===========================================
// EXPORT FOR TESTING (Optional)
// ===========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, getTopPredictions, formatDate, getContextualAdvice };
}
