// ===========================================
// UNEARTH - MAIN APPLICATION LOGIC
// ===========================================

// Application State
const AppState = {
    currentScreen: 'main',
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
    // Navigation
    document.getElementById('statsBtn').addEventListener('click', () => showScreen('stats'));
    document.getElementById('backFromStats').addEventListener('click', () => showScreen('main'));
    document.getElementById('backFromDetail').addEventListener('click', () => showScreen('main'));
    
    // Add Item
    document.getElementById('addItemBtn').addEventListener('click', openAddItemModal);
    document.getElementById('cancelAddBtn').addEventListener('click', closeAddItemModal);
    document.getElementById('saveItemBtn').addEventListener('click', saveNewItem);
    document.getElementById('itemNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveNewItem();
    });
    
    // Item Actions
    document.getElementById('lostBtn').addEventListener('click', handleLostItem);
    document.getElementById('deleteItemBtn').addEventListener('click', openDeleteModal);
    
    // Found Location
    document.getElementById('cancelFoundBtn').addEventListener('click', closeFoundModal);
    document.getElementById('saveFoundBtn').addEventListener('click', saveFoundLocation);
    document.getElementById('locationInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveFoundLocation();
    });
    
    // Delete Confirmation
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
}

// ===========================================
// SCREEN NAVIGATION
// ===========================================

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    if (screenName === 'main') {
        document.getElementById('mainScreen').classList.add('active');
        renderItemsList();
    } else if (screenName === 'stats') {
        document.getElementById('statsScreen').classList.add('active');
        renderStats();
    } else if (screenName === 'detail') {
        document.getElementById('itemDetailScreen').classList.add('active');
        renderItemDetail();
    }
    
    AppState.currentScreen = screenName;
}

// ===========================================
// ITEM MANAGEMENT
// ===========================================

function openAddItemModal() {
    document.getElementById('addItemModal').classList.remove('hidden');
    document.getElementById('itemNameInput').value = '';
    document.getElementById('itemNameInput').focus();
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
    
    // Create new item
    AppState.data.items[itemName] = {
        totalLost: 0,
        locations: {},
        logs: []
    };
    
    saveData();
    closeAddItemModal();
    renderItemsList();
    showToast(`${itemName} added`);
}

function openItemDetail(itemName) {
    AppState.currentItem = itemName;
    showScreen('detail');
}

function handleLostItem() {
    if (!AppState.currentItem) return;
    
    const item = AppState.data.items[AppState.currentItem];
    item.totalLost++;
    
    // Add log entry
    const log = {
        lostAt: new Date().toISOString(),
        foundAt: null,
        location: null
    };
    item.logs.unshift(log);
    
    saveData();
    showToast('Logged as lost');
    
    // Open found modal
    openFoundModal();
}

function openFoundModal() {
    document.getElementById('foundModal').classList.remove('hidden');
    document.getElementById('locationInput').value = '';
    document.getElementById('locationInput').focus();
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
    
    // Update most recent log
    if (item.logs.length > 0) {
        item.logs[0].foundAt = new Date().toISOString();
        item.logs[0].location = location;
    }
    
    // Update location frequency
    if (!item.locations[location]) {
        item.locations[location] = 0;
    }
    item.locations[location]++;
    
    saveData();
    closeFoundModal();
    renderItemDetail();
    showToast(`Found at ${location}`);
}

function openDeleteModal() {
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

function confirmDelete() {
    if (!AppState.currentItem) return;
    
    delete AppState.data.items[AppState.currentItem];
    saveData();
    closeDeleteModal();
    showScreen('main');
    showToast('Item deleted');
}

// ===========================================
// RENDERING
// ===========================================

function render() {
    renderItemsList();
}

function renderItemsList() {
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
    itemsList.innerHTML = '';
    
    items.forEach(itemName => {
        const item = AppState.data.items[itemName];
        const predictions = getTopPredictions(item, 3);
        
        const card = document.createElement('div');
        card.className = 'item-card';
        card.addEventListener('click', () => openItemDetail(itemName));
        
        card.innerHTML = `
            <div class="item-card-header">
                <div class="item-name">${itemName}</div>
                <div class="item-count">Lost ${item.totalLost}x</div>
            </div>
            <div class="item-predictions">
                ${predictions.map((pred, idx) => 
                    `<div class="prediction-tag">#${idx + 1} ${pred.location}</div>`
                ).join('')}
                ${predictions.length === 0 ? '<div class="prediction-tag">No data yet</div>' : ''}
            </div>
        `;
        
        itemsList.appendChild(card);
    });
}

function renderItemDetail() {
    if (!AppState.currentItem) return;
    
    const item = AppState.data.items[AppState.currentItem];
    
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
            <div class="prediction-item">
                <div class="prediction-rank">${idx + 1}</div>
                <div class="prediction-location">${pred.location}</div>
                <div class="prediction-count">${pred.count}x</div>
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
            <div class="log-item">
                <div class="log-location">${log.location || 'Lost (not found yet)'}</div>
                <div class="log-time">${formatDate(log.lostAt)}</div>
            </div>
        `).join('');
    }
}

function renderStats() {
    // Total losses
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
    
    // Top location
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
            <div class="badge ${earned ? 'earned' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `;
    }).join('');
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
    }, 2000);
}

// ===========================================
// SERVICE WORKER REGISTRATION
// ===========================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
}

// ===========================================
// EXPORT FOR TESTING (Optional)
// ===========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, getTopPredictions, formatDate };
}
