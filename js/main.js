// ============================================
// NGO ERP SYSTEM - COMPLETE JAVASCRIPT
// ============================================

// ============================================
// INITIAL DATA STRUCTURE WITH MULTI-USER ROLES
// ============================================

// Define all possible permissions
const PERMISSIONS = {
    // Beneficiary permissions
    VIEW_BENEFICIARIES: 'view_beneficiaries',
    ADD_BENEFICIARY: 'add_beneficiary',
    EDIT_BENEFICIARY: 'edit_beneficiary',
    DELETE_BENEFICIARY: 'delete_beneficiary',
    EXPORT_BENEFICIARIES: 'export_beneficiaries',
    
    // Donation permissions
    VIEW_DONATIONS: 'view_donations',
    ADD_DONATION: 'add_donation',
    EDIT_DONATION: 'edit_donation',
    DELETE_DONATION: 'delete_donation',
    GENERATE_RECEIPT: 'generate_receipt',
    
    // Expense permissions
    VIEW_EXPENSES: 'view_expenses',
    ADD_EXPENSE: 'add_expense',
    EDIT_EXPENSE: 'edit_expense',
    DELETE_EXPENSE: 'delete_expense',
    APPROVE_EXPENSE: 'approve_expense',
    
    // Program permissions
    VIEW_PROGRAMS: 'view_programs',
    ADD_PROGRAM: 'add_program',
    EDIT_PROGRAM: 'edit_program',
    DELETE_PROGRAM: 'delete_program',
    
    // Volunteer permissions
    VIEW_VOLUNTEERS: 'view_volunteers',
    ADD_VOLUNTEER: 'add_volunteer',
    EDIT_VOLUNTEER: 'edit_volunteer',
    DELETE_VOLUNTEER: 'delete_volunteer',
    
    // Report permissions
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',
    
    // Admin permissions
    MANAGE_USERS: 'manage_users',
    MANAGE_SETTINGS: 'manage_settings',
    VIEW_LOGS: 'view_logs',
    
    // Special
    ALL: 'all'  // Super admin
};

async function saveRecord(collectionName, record) {
    saveData();
    const id = await fbSave(collectionName, record);
    if (id) console.log('Saved to Firebase: ' + collectionName + '/' + id);
    updateDashboard();
    updateProgramStats();
    updateRecentActivity();
    updateNotificationBadge();
}

async function deleteRecord(collectionName, id) {
    saveData();
    await fbDelete(collectionName, id);
    console.log('Deleted from Firebase: ' + collectionName + '/' + id);
    updateDashboard();
    updateProgramStats();
    updateRecentActivity();
    updateNotificationBadge();
}


// ============================================
// ✅ FIREBASE REALTIME DATABASE HELPERS
// ============================================
async function fbSave(collectionName, data) {
    try {
        // Wait for Firebase to be ready if not yet initialised
        if (!window._firebase) {
            await new Promise(function(resolve) {
                window.addEventListener('firebase-ready', resolve, { once: true });
            });
        }
        if (!window._firebase) { console.error('Firebase never became ready'); return null; }
        const { db, ref, set } = window._firebase;
        await set(ref(db, collectionName + '/' + data.id), data);
        console.log('✅ Firebase saved: ' + collectionName + '/' + data.id);
        return data.id;
    } catch (err) { console.error('Firebase save error:', err); return null; }
}
async function fbDelete(collectionName, id) {
    try {
        // Wait for Firebase to be ready if not yet initialised
        if (!window._firebase) {
            await new Promise(function(resolve) {
                window.addEventListener('firebase-ready', resolve, { once: true });
            });
        }
        if (!window._firebase) { console.error('Firebase never became ready'); return; }
        const { db, ref, remove } = window._firebase;
        await remove(ref(db, collectionName + '/' + id));
        console.log('✅ Firebase deleted: ' + collectionName + '/' + id);
    } catch (err) { console.error('Firebase delete error:', err); }
}
async function fbLoad(collectionName) {
    try {
        if (!window._firebase) return [];
        const { db, ref, get } = window._firebase;
        const snapshot = await get(ref(db, collectionName));
        if (!snapshot.exists()) return [];
        return Object.values(snapshot.val());
    } catch (err) { console.error('Firebase load error:', err); return []; }
}



let ngoData = {
    beneficiaries: [],
    donations: [],
    expenses: [],
    programs: [],
    volunteers: [],
    users: [
        // Super Admin - Full access to everything
        { 
            id: 1, 
            username: 'admin', 
            password: 'admin123', 
            role: 'super_admin', 
            name: 'System Administrator', 
            email: 'admin@ngo.org',
            department: 'IT',
            permissions: [PERMISSIONS.ALL]  // Full access
        },
        
        // Finance Department
        { 
            id: 2, 
            username: 'finance', 
            password: 'finance123', 
            role: 'finance_manager', 
            name: 'Finance Manager', 
            email: 'finance@ngo.org',
            department: 'Finance',
            permissions: [
                PERMISSIONS.VIEW_DONATIONS,
                PERMISSIONS.ADD_DONATION,
                PERMISSIONS.EDIT_DONATION,
                PERMISSIONS.DELETE_DONATION,
                PERMISSIONS.GENERATE_RECEIPT,
                PERMISSIONS.VIEW_EXPENSES,
                PERMISSIONS.ADD_EXPENSE,
                PERMISSIONS.EDIT_EXPENSE,
                PERMISSIONS.APPROVE_EXPENSE,
                PERMISSIONS.VIEW_REPORTS,
                PERMISSIONS.EXPORT_REPORTS
            ]
        },
        { 
            id: 3, 
            username: 'accountant', 
            password: 'accountant123', 
            role: 'accountant', 
            name: 'Senior Accountant', 
            email: 'accountant@ngo.org',
            department: 'Finance',
            permissions: [
                PERMISSIONS.VIEW_DONATIONS,
                PERMISSIONS.ADD_DONATION,
                PERMISSIONS.VIEW_EXPENSES,
                PERMISSIONS.ADD_EXPENSE,
                PERMISSIONS.VIEW_REPORTS
            ]
        },
        
        // Programs Department
        { 
            id: 4, 
            username: 'program', 
            password: 'program123', 
            role: 'program_manager', 
            name: 'Program Director', 
            email: 'programs@ngo.org',
            department: 'Programs',
            permissions: [
                PERMISSIONS.VIEW_BENEFICIARIES,
                PERMISSIONS.ADD_BENEFICIARY,
                PERMISSIONS.EDIT_BENEFICIARY,
                PERMISSIONS.VIEW_PROGRAMS,
                PERMISSIONS.ADD_PROGRAM,
                PERMISSIONS.EDIT_PROGRAM,
                PERMISSIONS.VIEW_VOLUNTEERS,
                PERMISSIONS.VIEW_REPORTS
            ]
        },
        { 
            id: 5, 
            username: 'coordinator', 
            password: 'coord123', 
            role: 'program_coordinator', 
            name: 'Program Coordinator', 
            email: 'coordinator@ngo.org',
            department: 'Programs',
            permissions: [
                PERMISSIONS.VIEW_BENEFICIARIES,
                PERMISSIONS.ADD_BENEFICIARY,
                PERMISSIONS.EDIT_BENEFICIARY,
                PERMISSIONS.VIEW_PROGRAMS,
                PERMISSIONS.VIEW_VOLUNTEERS
            ]
        },
        
        // Field Operations
        { 
            id: 6, 
            username: 'field', 
            password: 'field123', 
            role: 'field_staff', 
            name: 'Field Officer', 
            email: 'field@ngo.org',
            department: 'Operations',
            permissions: [
                PERMISSIONS.VIEW_BENEFICIARIES,
                PERMISSIONS.ADD_BENEFICIARY,
                PERMISSIONS.EDIT_BENEFICIARY,
                PERMISSIONS.VIEW_PROGRAMS,
                PERMISSIONS.VIEW_TASKS
            ]
        },
        { 
            id: 7, 
            username: 'outreach', 
            password: 'outreach123', 
            role: 'outreach_worker', 
            name: 'Outreach Worker', 
            email: 'outreach@ngo.org',
            department: 'Operations',
            permissions: [
                PERMISSIONS.VIEW_BENEFICIARIES,
                PERMISSIONS.ADD_BENEFICIARY
            ]
        },
        
        // Volunteer Management
        { 
            id: 8, 
            username: 'volunteer', 
            password: 'volunteer123', 
            role: 'volunteer_manager', 
            name: 'Volunteer Coordinator', 
            email: 'volunteers@ngo.org',
            department: 'HR',
            permissions: [
                PERMISSIONS.VIEW_VOLUNTEERS,
                PERMISSIONS.ADD_VOLUNTEER,
                PERMISSIONS.EDIT_VOLUNTEER,
                PERMISSIONS.VIEW_PROGRAMS,
                PERMISSIONS.VIEW_REPORTS
            ]
        },
        
        // HR Department
        { 
            id: 9, 
            username: 'hr', 
            password: 'hr123', 
            role: 'hr_manager', 
            name: 'HR Manager', 
            email: 'hr@ngo.org',
            department: 'Human Resources',
            permissions: [
                PERMISSIONS.VIEW_VOLUNTEERS,
                PERMISSIONS.ADD_VOLUNTEER,
                PERMISSIONS.EDIT_VOLUNTEER,
                PERMISSIONS.DELETE_VOLUNTEER,
                PERMISSIONS.MANAGE_USERS,
                PERMISSIONS.VIEW_REPORTS
            ]
        },
        
        // Executive Management
        { 
            id: 10, 
            username: 'director', 
            password: 'director123', 
            role: 'executive_director', 
            name: 'Executive Director', 
            email: 'director@ngo.org',
            department: 'Executive',
            permissions: [
                PERMISSIONS.VIEW_BENEFICIARIES,
                PERMISSIONS.VIEW_DONATIONS,
                PERMISSIONS.VIEW_EXPENSES,
                PERMISSIONS.VIEW_PROGRAMS,
                PERMISSIONS.VIEW_VOLUNTEERS,
                PERMISSIONS.VIEW_REPORTS,
                PERMISSIONS.EXPORT_REPORTS,
                PERMISSIONS.VIEW_LOGS
            ]
        },
        { 
            id: 11, 
            username: 'board', 
            password: 'board123', 
            role: 'board_member', 
            name: 'Board Member', 
            email: 'board@ngo.org',
            department: 'Board',
            permissions: [
                PERMISSIONS.VIEW_REPORTS,
                PERMISSIONS.VIEW_DONATIONS,
                PERMISSIONS.VIEW_EXPENSES
            ]
        },
        
        // Guest/Read-Only Access
        { 
            id: 12, 
            username: 'guest', 
            password: 'guest123', 
            role: 'guest', 
            name: 'Guest User', 
            email: 'guest@ngo.org',
            department: 'External',
            permissions: [
                PERMISSIONS.VIEW_REPORTS
            ]
        },
        { 
            id: 13, 
            username: 'auditor', 
            password: 'audit123', 
            role: 'auditor', 
            name: 'External Auditor', 
            email: 'audit@ngo.org',
            department: 'External',
            permissions: [
                PERMISSIONS.VIEW_DONATIONS,
                PERMISSIONS.VIEW_EXPENSES,
                PERMISSIONS.VIEW_REPORTS,
                PERMISSIONS.EXPORT_REPORTS
            ]
        }
    ],
    messages: [],
    announcements: [],
    newsletters: [],
    tasks: [],
    events: [],
    documents: [],
    notifications: [],
    activities: [],
    settings: {
        theme: 'light',
        accentColor: '#27ae60',
        currency: 'INR',
        emailNotifications: true,
        smsNotifications: false,
        taskReminders: true,
        twoFactorAuth: false,
        sessionTimeout: true,
        defaultReportPeriod: 'monthly',
        organizationName: 'NGO ERP',
        organizationEmail: 'info@ngo.org',
        organizationPhone: '+1 234 567 890',
        organizationAddress: '123 Charity St, City, Country'
    }
}
var _docActiveCategory = 'all';
var _docActiveType = 'all';
;
// Current logged in user
let currentUser = null;

// Calendar instance
let calendar = null;

// Chart instances
let financialChart = null;
let donationSourceChart = null;
let programPerformanceChart = null;
let volunteerHoursChart = null;
let expenseChart = null;
let growthChart = null;
let demographicsChart = null;

// ============================================
// OFFLINE STORAGE VARIABLES
// ============================================

let offlineDB = null;
let autoSyncInterval = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setDefaultDates();
    loadDailyQuote();
    initializeEventListeners();
    
    initOfflineDB().then(() => {
        console.log('Offline DB ready');
        startAutoSync();
    });
    
    registerServiceWorker();
    initMobileFeatures();
    
    window.addEventListener('beforeunload', function() {
        saveData();
    });
});

// Add this function after ngoData declaration
function initializeSampleEvents() {
    if (!ngoData.events || ngoData.events.length === 0) {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(today.getDate() + 14);
        
        ngoData.events = [
            {
                id: 1,
                title: 'Volunteer Meeting',
                date: today.toISOString().split('T')[0],
                time: '10:00',
                description: 'Monthly volunteer coordination meeting',
                type: 'volunteer'
            },
            {
                id: 2,
                title: 'Donation Drive',
                date: nextWeek.toISOString().split('T')[0],
                time: '09:00',
                description: 'Community donation collection event',
                type: 'donation'
            },
            {
                id: 3,
                title: 'Program Review',
                date: nextMonth.toISOString().split('T')[0],
                time: '14:00',
                description: 'Quarterly program performance review',
                type: 'program'
            },
            {
                id: 4,
                title: 'Staff Meeting',
                date: twoWeeksLater.toISOString().split('T')[0],
                time: '11:30',
                description: 'Monthly staff coordination',
                type: 'meeting'
            }
        ];
        saveData();
    }
}

function initializeEventListeners() {
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('eventForm')?.addEventListener('submit', handleAddEvent);
    document.getElementById('documentForm')?.addEventListener('submit', handleUploadDocument);
    document.getElementById('messageForm')?.addEventListener('submit', handleSendMessage);
    document.getElementById('announcementForm')?.addEventListener('submit', handleAddAnnouncement);
    document.getElementById('newsletterForm')?.addEventListener('submit', handleSendNewsletter);
    document.getElementById('taskForm')?.addEventListener('submit', handleAddTask);
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.quick-actions-menu') && !e.target.closest('.icon-btn')) {
            document.getElementById('quickActionsMenu').style.display = 'none';
        }
        if (!e.target.closest('.notifications-panel') && !e.target.closest('.fa-bell')) {
            document.getElementById('notificationsPanel').style.display = 'none';
        }
    });
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/js/service-worker.js')
                .then(function(registration) {
                    console.log('ServiceWorker registered:', registration.scope);
                    
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        console.log('New service worker installing');
                    });
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed:', error);
                });
            
            navigator.serviceWorker.addEventListener('message', function(event) {
                if (event.data.type === 'SYNC_COMPLETED') {
                    showToast('Data synced with server', 'success');
                    loadData();
                }
            });
        });
    }
    
    window.addEventListener('online', function() {
        showToast('You are back online! Syncing...', 'success');
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-data');
            });
        }
        processSyncQueue();
    });
    
    window.addEventListener('offline', function() {
        showToast('You are offline. Working in offline mode.', 'warning');
    });
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        showInstallPrompt();
    });
}

function showInstallPrompt() {
    const installBtn = document.createElement('button');
    installBtn.className = 'install-pwa-btn';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
    installBtn.onclick = installPWA;
    document.querySelector('.top-bar-actions')?.appendChild(installBtn);
}

function installPWA() {
    const prompt = window.deferredPrompt;
    if (!prompt) return;
    
    prompt.prompt();
    
    prompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted install');
            showToast('App installed successfully!', 'success');
        }
        window.deferredPrompt = null;
    });
}

// ============================================
// MOBILE FEATURES
// ============================================

function initMobileFeatures() {
    addMobileCSS();
    addShareButtons();
    addVoiceButton();
    initTouchGestures();
    
    if (Notification.permission === 'default') {
        requestNotificationPermission();
    }
    
    initBatteryMonitoring();
    initNetworkMonitoring();
    initVisibilityMonitoring();
}

function addMobileCSS() {
    const mobileCSS = `
        .pull-to-refresh {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--primary-color);
            color: white;
            text-align: center;
            padding: 15px;
            z-index: 2000;
            animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(-100%);
            }
            to {
                transform: translateY(0);
            }
        }
        
        .install-pwa-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            animation: pulse 2s infinite;
        }
        
        .install-pwa-btn:hover {
            background: var(--primary-dark);
        }
        
        @media (max-width: 768px) {
            .install-pwa-btn {
                padding: 6px 12px;
                font-size: 12px;
            }
            
            .pull-to-refresh {
                font-size: 14px;
                padding: 12px;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = mobileCSS;
    document.head.appendChild(style);
}

function initTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let refreshing = false;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchmove', e => {
        if (window.scrollY === 0 && !refreshing) {
            touchEndY = e.changedTouches[0].screenY;
            const diff = touchEndY - touchStartY;
            
            if (diff > 100) {
                showPullToRefresh();
            }
        }
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                document.getElementById('sidebar')?.classList.add('show');
            } else {
                document.getElementById('sidebar')?.classList.remove('show');
            }
        }
    }
    
    function showPullToRefresh() {
        if (refreshing) return;
        
        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-to-refresh';
        refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
        document.body.prepend(refreshIndicator);
        
        refreshing = true;
        
        setTimeout(() => {
            loadData();
            refreshIndicator.remove();
            refreshing = false;
        }, 1500);
    }
}

function addShareButtons() {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'icon-btn';
    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
    shareBtn.onclick = () => shareData({
        title: document.title,
        text: 'Check out NGO ERP System',
        url: window.location.href
    });
    
    document.querySelector('.top-bar-actions')?.appendChild(shareBtn);
}

async function shareData(data) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: data.title || 'NGO ERP Data',
                text: data.text || '',
                url: data.url || window.location.href
            });
            showToast('Shared successfully', 'success');
        } catch (error) {
            console.error('Share failed:', error);
        }
    } else {
        prompt('Copy this link:', data.url || window.location.href);
    }
}

// ============================================
// VOICE INPUT
// ============================================

class VoiceInput {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.setupListeners();
        }
    }
    
    setupListeners() {
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.handleVoiceInput(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
        };
    }
    
    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.isListening = true;
            showToast('Listening...', 'info');
        }
    }
    
    handleVoiceInput(text) {
        showToast(`Heard: "${text}"`, 'success');
        
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('add beneficiary')) {
            showSection('beneficiaries');
            showAddBeneficiaryModal();
        } else if (lowerText.includes('add donation')) {
            showSection('donations');
            showAddDonationModal();
        } else if (lowerText.includes('show dashboard')) {
            showSection('dashboard');
        } else if (lowerText.includes('show reports')) {
            showSection('reports');
        } else if (lowerText.includes('add volunteer')) {
            showSection('volunteers');
            showAddVolunteerModal();
        } else if (lowerText.includes('add event')) {
            showAddEventModal();
        } else if (lowerText.includes('add expense')) {
            showSection('expenses');
            showAddExpenseModal();
        } else if (lowerText.includes('add program')) {
            showSection('programs');
            showAddProgramModal();
        }
    }
}

const voiceInput = new VoiceInput();

function addVoiceButton() {
    if (!voiceInput.recognition) return;
    
    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'icon-btn';
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceBtn.onclick = () => voiceInput.startListening();
    
    document.querySelector('.top-bar-actions')?.appendChild(voiceBtn);
}

// ============================================
// BATTERY MONITORING
// ============================================

function initBatteryMonitoring() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            function updateBatteryStatus() {
                const level = battery.level * 100;
                const charging = battery.charging;
                
                if (level < 20 && !charging) {
                    showToast(`Battery low: ${level.toFixed(0)}%`, 'warning');
                    sendNotification('Battery Low', {
                        body: `Your battery is at ${level.toFixed(0)}%. Please save your work.`
                    });
                }
            }
            
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingchange', updateBatteryStatus);
            updateBatteryStatus();
        });
    }
}

// ============================================
// NETWORK MONITORING
// ============================================

function initNetworkMonitoring() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        
        function updateNetworkStatus() {
            const type = connection.effectiveType;
            const downlink = connection.downlink;
            
            if (type === 'slow-2g' || type === '2g') {
                showToast('Slow network detected. Using offline mode.', 'warning');
            }
            
            console.log(`Network: ${type}, Speed: ${downlink} Mbps`);
        }
        
        connection.addEventListener('change', updateNetworkStatus);
        updateNetworkStatus();
    }
}

// ============================================
// VISIBILITY MONITORING
// ============================================

function initVisibilityMonitoring() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('Tab hidden, pausing updates');
            if (autoSyncInterval) clearInterval(autoSyncInterval);
        } else {
            console.log('Tab visible, resuming updates');
            startAutoSync();
        }
    });
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        showToast('Notifications enabled', 'success');
        subscribeToPush();
    }
}

async function subscribeToPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
        });
        
        console.log('Push subscription:', subscription);
        localStorage.setItem('pushSubscription', JSON.stringify(subscription));
        
    } catch (error) {
        console.error('Push subscription failed:', error);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function sendNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: options.body || '',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                vibrate: [200, 100, 200],
                ...options
            });
        });
    }
}

// ============================================
// OFFLINE DATABASE (IndexedDB)
// ============================================

function initOfflineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NGODB', 2);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            offlineDB = request.result;
            resolve(offlineDB);
        };
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('beneficiaries')) {
                const store = db.createObjectStore('beneficiaries', { keyPath: 'id' });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('updated', 'updated', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('donations')) {
                db.createObjectStore('donations', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('expenses')) {
                db.createObjectStore('expenses', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('programs')) {
                db.createObjectStore('programs', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('volunteers')) {
                db.createObjectStore('volunteers', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('syncQueue')) {
                const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                queueStore.createIndex('pending', 'pending', { unique: false });
                queueStore.createIndex('attempts', 'attempts', { unique: false });
            }
        };
    });
}

async function saveOffline(storeName, data) {
    if (!offlineDB) await initOfflineDB();
    
    return new Promise((resolve, reject) => {
        const transaction = offlineDB.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const item = {
            ...data,
            synced: navigator.onLine,
            updated: new Date().toISOString()
        };
        
        const request = store.put(item);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function getOfflineData(storeName, query = {}) {
    if (!offlineDB) await initOfflineDB();
    
    return new Promise((resolve, reject) => {
        const transaction = offlineDB.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            let results = request.result;
            
            if (query.filter) {
                results = results.filter(query.filter);
            }
            
            if (query.sort) {
                results.sort(query.sort);
            }
            
            if (query.limit) {
                results = results.slice(0, query.limit);
            }
            
            resolve(results);
        };
    });
}

async function addToSyncQueue(action, data) {
    if (!offlineDB) await initOfflineDB();
    
    return new Promise((resolve, reject) => {
        const transaction = offlineDB.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        
        const queueItem = {
            action,
            data,
            pending: true,
            created: new Date().toISOString(),
            attempts: 0
        };
        
        const request = store.add(queueItem);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            if ('serviceWorker' in navigator && 'SyncManager' in window && navigator.onLine) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register('sync-data');
                });
            }
            resolve(request.result);
        };
    });
}

async function processSyncQueue() {
    if (!offlineDB) await initOfflineDB();
    if (!navigator.onLine) return;
    
    const transaction = offlineDB.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const index = store.index('pending');
    const request = index.getAll(true);
    
    request.onsuccess = async () => {
        const queue = request.result;
        
        for (const item of queue) {
            try {
                await syncToServer(item);
                
                const deleteRequest = store.delete(item.id);
                deleteRequest.onsuccess = () => {
                    console.log('Synced item:', item.id);
                };
                
            } catch (error) {
                console.error('Sync failed:', error);
                
                item.attempts++;
                if (item.attempts < 5) {
                    store.put(item);
                } else {
                    item.pending = false;
                    store.put(item);
                }
            }
        }
    };
}

async function syncToServer(item) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Synced to server:', item);
            resolve();
        }, 1000);
    });
}

function startAutoSync() {
    if (autoSyncInterval) clearInterval(autoSyncInterval);
    autoSyncInterval = setInterval(() => {
        if (navigator.onLine) {
            processSyncQueue();
        }
    }, 300000);
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (savedUser && rememberMe === 'true') {
        currentUser = JSON.parse(savedUser);
        loginSuccess();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    document.getElementById('loginModal')?.classList.add('show');
    document.getElementById('appContainer').style.display = 'none';
}

function loginSuccess() {
    document.getElementById('loggedInUser').innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
    document.getElementById('userRole').textContent = capitalizeFirst(currentUser.role);
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('loginModal')?.classList.remove('show');
    document.getElementById('appContainer').style.display = 'block';
    
    loadData();
    showToast(`Welcome back, ${currentUser.name}!`, 'success');
    addActivity('login', `User ${currentUser.name} logged in`);
    
    updatePageTitle('dashboard');
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const user = ngoData.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Set role-specific dashboard
        const dashboard = getRoleDashboard(user.role);
        showSection(dashboard);
        
        // Update UI based on role
        updateUIForRole(user.role);
        
        loginSuccess();
    } else {
        document.getElementById('loginError').textContent = 'Invalid username or password';
        showToast('Invalid credentials', 'error');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    if (!localStorage.getItem('rememberMe')) {
        localStorage.removeItem('rememberMe');
    }
    currentUser = null;
    showLoginModal();
    showToast('Logged out successfully', 'info');
}

function showForgotPassword() {
    closeModal('loginModal');
    document.getElementById('forgotModal')?.classList.add('show');
}

function closeForgotModal() {
    document.getElementById('forgotModal')?.classList.remove('show');
    document.getElementById('loginModal')?.classList.add('show');
}

function sendResetLink() {
    const email = document.getElementById('resetEmail').value;
    if (email) {
        showToast(`Reset link sent to ${email}`, 'success');
        closeForgotModal();
    } else {
        showToast('Please enter your email', 'warning');
    }
}

// ============================================
// DATA MANAGEMENT
// ============================================

function loadData() {
    showLoading();
    if (!navigator.onLine) {
        showToast('Working in offline mode', 'info');
        loadOfflineData().then(function() { hideLoading(); });
        return;
    }
    if (window._firebase) {
        _doFirebaseLoad();
    } else {
        console.log('Waiting for Firebase...');
        window.addEventListener('firebase-ready', function() { _doFirebaseLoad(); }, { once: true });
        setTimeout(function() {
            if (!window._firebaseLoaded) { console.warn('Firebase timeout - using localStorage'); _loadFromLocalStorage(); }
        }, 6000);
    }
}
function _doFirebaseLoad() {
    window._firebaseLoaded = true;
    Promise.all([fbLoad('beneficiaries'), fbLoad('donations'), fbLoad('expenses'), fbLoad('programs'), fbLoad('volunteers'), fbLoad('events'), fbLoad('documents'), fbLoad('messages'), fbLoad('announcements'), fbLoad('newsletters')])
    .then(function(results) {
        ngoData.beneficiaries = results[0];
        ngoData.donations     = results[1];
        ngoData.expenses      = results[2];
        ngoData.programs      = results[3];
        ngoData.volunteers    = results[4];
        if (results[5] && results[5].length) ngoData.events        = results[5];
        if (results[6] && results[6].length) ngoData.documents     = results[6];
        if (results[7] && results[7].length) ngoData.messages      = results[7];
        if (results[8] && results[8].length) ngoData.announcements = results[8];
        if (results[9] && results[9].length) ngoData.newsletters   = results[9];
        var saved = localStorage.getItem('ngoData');
        if (saved) {
            try {
                var p = JSON.parse(saved);
                if (p.settings)      ngoData.settings      = p.settings;
                if (p.users)         ngoData.users         = p.users;
                if (p.activities)    ngoData.activities    = p.activities;
                // events not restored from localStorage - Firebase is source of truth
                if (p.tasks) ngoData.tasks = p.tasks;
                // messages, announcements, documents — Firebase is source of truth
            } catch(e) {}
        }
        // Merge fileData from localStorage into Firebase documents
        try {
            var lsRaw = localStorage.getItem('ngoData');
            if (lsRaw) {
                var lsParsed = JSON.parse(lsRaw);
                if (lsParsed.documents && lsParsed.documents.length && ngoData.documents && ngoData.documents.length) {
                    var lsMap = {};
                    lsParsed.documents.forEach(function(d) { if (d.fileData) lsMap[d.id] = d.fileData; });
                    ngoData.documents.forEach(function(d) { if (!d.fileData && lsMap[d.id]) d.fileData = lsMap[d.id]; });
                }
                if (!ngoData.documents || !ngoData.documents.length) {
                    if (lsParsed.documents && lsParsed.documents.length) ngoData.documents = lsParsed.documents;
                }
            }
        } catch(ex) {}
        if (!ngoData.events || ngoData.events.length === 0) initializeSampleEvents();
        applySettings();
        updateAll();
        hideLoading();
        console.log('✅ Firebase loaded. Programs: ' + ngoData.programs.length);
        showToast('✅ Data loaded from Firebase', 'success');
    }).catch(function(err) {
        console.error('Firebase load error:', err);
        _loadFromLocalStorage();
    });
}
function _loadFromLocalStorage() {
    var saved = localStorage.getItem('ngoData');
    if (saved) { try { ngoData = Object.assign({}, ngoData, JSON.parse(saved)); } catch(e) {} }
    initializeSampleEvents(); applySettings(); updateAll(); hideLoading();
}



function _loadFromLocalStorage() {
    const saved = localStorage.getItem('ngoData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            ngoData = { ...ngoData, ...parsed };
        } catch (e) {
            console.error('Error loading localStorage data:', e);
        }
    }
    initializeSampleEvents();
    applySettings();
    updateAll();
    hideLoading();
}

async function loadOfflineData() {
    try {
        const beneficiaries = await getOfflineData('beneficiaries');
        const donations = await getOfflineData('donations');
        const expenses = await getOfflineData('expenses');
        const programs = await getOfflineData('programs');
        const volunteers = await getOfflineData('volunteers');
        
        if (beneficiaries.length > 0) {
            ngoData.beneficiaries = beneficiaries[0].data || [];
        }
        if (donations.length > 0) {
            ngoData.donations = donations[0].data || [];
        }
        if (expenses.length > 0) {
            ngoData.expenses = expenses[0].data || [];
        }
        if (programs.length > 0) {
            ngoData.programs = programs[0].data || [];
        }
        if (volunteers.length > 0) {
            ngoData.volunteers = volunteers[0].data || [];
        }
        
        applySettings();
        updateAll();
        
    } catch (error) {
        console.error('Offline load failed:', error);
        showToast('No offline data available', 'warning');
    }
}

function saveData() {
    localStorage.setItem('ngoData', JSON.stringify(ngoData));
    saveOfflineData();
    
    const now = new Date();
    localStorage.setItem('lastSave', now.toISOString());
}

async function saveOfflineData() {
    try {
        await saveOffline('beneficiaries', { id: 'bulk-beneficiaries', type: 'bulk', data: ngoData.beneficiaries });
        await saveOffline('donations',     { id: 'bulk-donations',     type: 'bulk', data: ngoData.donations });
        await saveOffline('expenses',      { id: 'bulk-expenses',      type: 'bulk', data: ngoData.expenses });
        await saveOffline('programs',      { id: 'bulk-programs',      type: 'bulk', data: ngoData.programs });
        await saveOffline('volunteers',    { id: 'bulk-volunteers',    type: 'bulk', data: ngoData.volunteers });
        
        if (!navigator.onLine) {
            await addToSyncQueue('sync-all', { timestamp: Date.now() });
        }
    } catch (error) {
        console.error('Offline save failed:', error);
    }
}

function backupData() {
    const dataStr = JSON.stringify(ngoData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngo_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup downloaded successfully', 'success');
    addActivity('backup', 'Data backup created');
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const restored = JSON.parse(event.target.result);
                ngoData = { ...ngoData, ...restored };
                saveData();
                updateAll();
                showToast('Data restored successfully', 'success');
                addActivity('restore', 'Data restored from backup');
            } catch (error) {
                showToast('Invalid backup file', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function clearData() {
    if (confirm('⚠️ Are you sure you want to clear ALL data? This cannot be undone!')) {
        ngoData = {
            beneficiaries: [],
            donations: [],
            expenses: [],
            programs: [],
            volunteers: [],
            users: ngoData.users,
            messages: [],
            announcements: [],
            newsletters: [],
            tasks: [],
            events: [],
            documents: [],
            notifications: [],
            activities: [],
            settings: ngoData.settings
        };
        saveData();
        updateAll();
        showToast('All data cleared', 'warning');
        addActivity('clear', 'All data cleared');
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showSection(sectionId) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeMenuItem = Array.from(document.querySelectorAll('.menu-item')).find(
        item => item.textContent.toLowerCase().includes(sectionId)
    );
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId)?.classList.add('active');
    
    updatePageTitle(sectionId);
    
    document.getElementById('sidebar')?.classList.remove('show');
    
    if (sectionId === 'calendar') {
        setTimeout(() => {
            initCalendar();
        }, 100);
    } else if (sectionId === 'reports') {
        setTimeout(() => {
            updateAnalytics();
            if (typeof updateAllCharts === 'function') {
                updateAllCharts();
            }
        }, 200);
    } else if (sectionId === 'expenses') {
        setTimeout(() => {
            updateExpenseChart();
        }, 100);
    } else if (sectionId === 'dashboard') {
        setTimeout(() => {
            updateAllCharts();
        }, 100);
    } else if (sectionId === 'communications') {
        updateMessageRecipients();
        setTimeout(function(){ updateCommsFormVisibility(); displayMessages(); displayAnnouncements(); displayNewsletters(); }, 100);
    } else if (sectionId === 'programs') {
        setTimeout(function(){ displayPrograms(); }, 100);
    } else if (sectionId === 'beneficiaries') {
        setTimeout(function(){ displayBeneficiaries(); }, 100);
    } else if (sectionId === 'donations') {
        setTimeout(function(){ displayDonations(); updateDonationStats(); }, 100);
    } else if (sectionId === 'volunteers') {
        setTimeout(function(){ displayVolunteers(); }, 100);
    } else if (sectionId === 'documents') {
        setTimeout(function(){ displayDocuments(); updateDocumentStats(); }, 100);
    }
}

function updatePageTitle(sectionId) {
    const titles = {
        'dashboard': 'Dashboard',
        'beneficiaries': 'Beneficiaries',
        'donations': 'Donations',
        'expenses': 'Expenses',
        'programs': 'Programs',
        'volunteers': 'Volunteers',
        'calendar': 'Calendar',
        'documents': 'Documents',
        'communications': 'Communications',
        'reports': 'Analytics',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
}

function toggleMobileMenu() {
    document.getElementById('sidebar')?.classList.toggle('show');
}

function showQuickActions() {
    const menu = document.getElementById('quickActionsMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

function showNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            displayNotifications();
        }
    }
}

function toggleTheme() {
    const theme = ngoData.settings.theme;
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'blue' : 'light';
    setTheme(newTheme);
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = newTheme === 'light' ? 'fas fa-sun' : 
                         newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-palette';
    }
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loadingOverlay').style.display = 'none';
    }, 500);
}

// ============================================
// THEME AND SETTINGS
// ============================================

function applySettings() {
    document.body.className = `${ngoData.settings.theme}-theme`;
    document.documentElement.style.setProperty('--primary-color', ngoData.settings.accentColor);
    
    const emailNotif = document.getElementById('emailNotifications');
    const smsNotif = document.getElementById('smsNotifications');
    const taskRemind = document.getElementById('taskReminders');
    const twoFactor = document.getElementById('twoFactorAuth');
    const sessionTimeout = document.getElementById('sessionTimeout');
    const reportPeriod = document.getElementById('defaultReportPeriod');
    const currency = document.getElementById('currency');
    
    if (emailNotif) emailNotif.checked = ngoData.settings.emailNotifications;
    if (smsNotif) smsNotif.checked = ngoData.settings.smsNotifications;
    if (taskRemind) taskRemind.checked = ngoData.settings.taskReminders;
    if (twoFactor) twoFactor.checked = ngoData.settings.twoFactorAuth;
    if (sessionTimeout) sessionTimeout.checked = ngoData.settings.sessionTimeout;
    if (reportPeriod) reportPeriod.value = ngoData.settings.defaultReportPeriod;
    if (currency) currency.value = ngoData.settings.currency;
}

function setTheme(theme) {
    ngoData.settings.theme = theme;
    document.body.className = `${theme}-theme`;
    saveData();
    showToast(`Theme changed to ${theme}`, 'info');
}

function changeAccentColor(color) {
    ngoData.settings.accentColor = color;
    document.documentElement.style.setProperty('--primary-color', color);
    saveData();
}

// ============================================
// CALENDAR FUNCTIONS
// ============================================

function initCalendar() {
    const calendarEl = document.getElementById('calendarContainer');
    if (!calendarEl) {
        console.log("Calendar container not found!");
        return;
    }
    
    calendarEl.innerHTML = '';
    
    const events = ngoData.events || [];
    console.log("Initializing calendar with events:", events);
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.date + 'T' + (event.time || '09:00'),
            end: event.date + 'T' + (event.time || '10:00'),
            description: event.description,
            className: `event-${event.type || 'meeting'}`
        })),
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        dateClick: function(info) {
            document.getElementById('eventDate').value = info.dateStr;
            showAddEventModal();
        },
        height: 'auto',
        themeSystem: 'standard',
        noEventsContent: 'No events scheduled. Click on a date to add an event!'
    });
    
    calendar.render();
    displayUpcomingEvents();
    console.log("Calendar rendered successfully");
}

function showAddEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) modal.classList.add('show');
    
    const timeInput = document.getElementById('eventTime');
    if (timeInput && !timeInput.value) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
}

function handleAddEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById('eventTitle')?.value;
    const date = document.getElementById('eventDate')?.value;
    const time = document.getElementById('eventTime')?.value;
    
    if (!title || !date) {
        showToast('Title and date are required!', 'warning');
        return;
    }
    
    const event = {
        id: Date.now(),
        title: title,
        date: date,
        time: time || '09:00',
        location: document.getElementById('eventLocation')?.value || '',
        description: document.getElementById('eventDescription')?.value || '',
        type: document.getElementById('eventType')?.value || 'meeting',
        createdBy: currentUser?.name || 'System',
        created: new Date().toISOString()
    };
    
    if (!ngoData.events) ngoData.events = [];
    ngoData.events.push(event);
    saveData();
    saveRecord('events', event);
    
    if (calendar) {
        calendar.addEvent({
            id: event.id,
            title: event.title,
            start: event.date + 'T' + event.time,
            description: event.description,
            className: `event-${event.type}`
        });
    }
    
    closeModal('eventModal');
    document.getElementById('eventForm')?.reset();
    showToast('Event added successfully', 'success');
    addActivity('event', `Event created: ${event.title}`);
    displayUpcomingEvents();
}

function filterCalendarByType(type) {
    if (!calendar) return;
    
    calendar.getEvents().forEach(event => {
        const shouldShow = type === 'all' || event.classNames.includes(`event-${type}`);
        event.setProp('display', shouldShow ? 'auto' : 'none');
    });
}

function displayUpcomingEvents() {
    const events = ngoData.events || [];
    const todayStr = new Date().toISOString().split('T')[0];

    const upcoming = events
        .filter(function(e) { return e.date >= todayStr; })
        .sort(function(a, b) { return a.date > b.date ? 1 : -1; })
        .slice(0, 5);

    const makeHTML = function(list) {
        if (list.length === 0) return '<p class="no-data">No upcoming events</p>';
        return list.map(function(e) {
            const parts = e.date.split('-');
            const dt = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
            return '<div class="event-item" onclick="showEventDetailsById(' + e.id + ')" style="cursor:pointer">' +
                '<div class="event-date">' +
                '<span class="day">' + dt.getDate() + '</span>' +
                '<span class="month">' + dt.toLocaleString('default', {month:'short'}) + '</span>' +
                '</div>' +
                '<div class="event-details">' +
                '<div class="event-title">' + e.title + '</div>' +
                '<div class="event-time">' + (e.time || 'All day') + ' \u2022 ' + (e.type || 'meeting') + '</div>' +
                '</div>' +
                '<span class="event-type ' + (e.type || 'meeting') + '">' + (e.type || 'meeting') + '</span>' +
                '</div>';
        }).join('');
    };

    const html = makeHTML(upcoming);
    // Write to dashboard widget AND calendar sidebar
    var dash = document.getElementById('upcomingEvents');
    var cal  = document.getElementById('eventList');
    if (dash) dash.innerHTML = html;
    if (cal)  cal.innerHTML  = html;
}

function showEventDetailsById(eventId) {
    const event = (ngoData.events || []).find(function(e) { return e.id === eventId; });
    if (!event) return;
    _showEventPopup(event);
}

function _closeEventPopup() {
    var p = document.getElementById('_eventDetailPopup');
    if (p) p.remove();
}

function _showEventPopup(ev) {
    _closeEventPopup();

    var typeColors = { program:'#27ae60', volunteer:'#3498db', donation:'#e67e22',
                       meeting:'#9b59b6', field_visit:'#e74c3c', training:'#f39c12', other:'#95a5a6' };
    var typeLabels = { program:'Program Event', volunteer:'Volunteer Activity', donation:'Donation Drive',
                       meeting:'Meeting', field_visit:'Field Visit', training:'Training', other:'Other' };
    var color = typeColors[ev.type] || '#95a5a6';
    var label = typeLabels[ev.type] || ev.type || 'Event';

    var dateDisplay = ev.date || '';
    if (ev.date) {
        var parts = ev.date.split('-');
        var dt = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
        dateDisplay = dt.toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
    }

    var popup = document.createElement('div');
    popup.id = '_eventDetailPopup';
    popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center';

    var inner = document.createElement('div');
    inner.style.cssText = 'background:#fff;border-radius:12px;padding:28px;max-width:440px;width:92%;box-shadow:0 20px 60px rgba(0,0,0,0.3)';

    // Header row
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px';
    var badge = document.createElement('span');
    badge.style.cssText = 'background:' + color + ';color:#fff;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600';
    badge.textContent = label;
    var closeX = document.createElement('button');
    closeX.style.cssText = 'background:none;border:none;font-size:22px;cursor:pointer;color:#aaa;line-height:1';
    closeX.textContent = '\u00d7';
    closeX.addEventListener('click', _closeEventPopup);
    header.appendChild(badge);
    header.appendChild(closeX);

    // Title
    var title = document.createElement('h3');
    title.style.cssText = 'color:#2c3e50;margin:0 0 14px;font-size:20px;line-height:1.3';
    title.textContent = ev.title || '';

    // Details
    var details = document.createElement('div');
    details.innerHTML =
        '<p style="margin:6px 0;color:#555"><strong>\uD83D\uDCC5</strong> ' + dateDisplay + '</p>' +
        (ev.time     ? '<p style="margin:6px 0;color:#555"><strong>\u23F0</strong> ' + ev.time + '</p>' : '') +
        (ev.location ? '<p style="margin:6px 0;color:#555"><strong>\uD83D\uDCCD</strong> ' + ev.location + '</p>' : '') +
        (ev.description ? '<p style="margin:12px 0 0;padding-top:12px;border-top:1px solid #eee;color:#666;font-size:14px"><strong>\uD83D\uDCDD</strong> ' + ev.description + '</p>' : '');

    // Footer buttons
    var footer = document.createElement('div');
    footer.style.cssText = 'margin-top:20px;text-align:right';

    if (ev.id) {
        var delBtn = document.createElement('button');
        delBtn.style.cssText = 'background:#e74c3c;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:14px;margin-right:8px';
        delBtn.textContent = '\uD83D\uDDD1 Delete';
        delBtn.addEventListener('click', function() {
            // Show inline confirmation - replace footer buttons
            footer.innerHTML = '';
            var msg = document.createElement('p');
            msg.style.cssText = 'margin:0 0 12px;color:#e74c3c;font-weight:600;font-size:14px';
            msg.textContent = 'Are you sure? This cannot be undone.';
            var yesBtn = document.createElement('button');
            yesBtn.style.cssText = 'background:#e74c3c;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:14px;margin-right:8px';
            yesBtn.textContent = 'Yes, Delete';
            yesBtn.addEventListener('click', function() { _doDeleteEvent(ev.id); });
            var noBtn = document.createElement('button');
            noBtn.style.cssText = 'background:#ecf0f1;color:#555;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:14px';
            noBtn.textContent = 'Cancel';
            noBtn.addEventListener('click', _closeEventPopup);
            footer.appendChild(msg);
            footer.appendChild(yesBtn);
            footer.appendChild(noBtn);
        });
        footer.appendChild(delBtn);
    }

    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:#ecf0f1;color:#555;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:14px';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', _closeEventPopup);
    footer.appendChild(closeBtn);

    inner.appendChild(header);
    inner.appendChild(title);
    inner.appendChild(details);
    inner.appendChild(footer);
    popup.appendChild(inner);

    popup.addEventListener('click', function(e) { if (e.target === popup) _closeEventPopup(); });
    document.body.appendChild(popup);
}

async function deleteEventById(eventId) {
    var ev = (ngoData.events || []).find(function(e) { return e.id === eventId; });
    if (ev) _showEventPopup(ev);
}

async function _doDeleteEvent(eventId) {
    var idNum = Number(eventId);
    var idStr = String(eventId);

    // 1. Close popup immediately
    _closeEventPopup();

    // 2. Remove from ngoData - Number() cast prevents string/number mismatch
    ngoData.events = (ngoData.events || []).filter(function(e) {
        return Number(e.id) !== idNum;
    });
    saveData();

    // 3. Remove from FullCalendar immediately
    if (window.calendar) {
        var calEv = window.calendar.getEventById(idStr) ||
                    window.calendar.getEventById(idNum);
        if (calEv) calEv.remove();
    }

    // 4. Refresh UI immediately
    displayUpcomingEvents();
    showToast('Event deleted!', 'success');

    // 5. Delete from Firebase via fbDelete (waits for firebase-ready if needed)
    await fbDelete('events', idNum);
}


function showEventDetails(event) {
    // Find event id from ngoData by matching title + date
    const dateStr = event.start ? event.start.toISOString().split('T')[0] : '';
    const matched = (ngoData.events || []).find(function(e) {
        return e.title === event.title && e.date === dateStr;
    });
    const eventId = matched ? matched.id : null;
    _showEventPopup({
        id:          eventId,
        title:       event.title,
        date:        dateStr,
        time:        event.start ? event.start.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : '',
        description: (event.extendedProps && event.extendedProps.description) || '',
        type:        (event.extendedProps && event.extendedProps.type) || (matched ? matched.type : '') || 'meeting',
        location:    matched ? (matched.location || '') : ''
    });
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

function showUploadModal() {
    document.getElementById('uploadModal')?.classList.add('show');
}

function handleUploadDocument(e) {
    if (e) e.preventDefault();

    // Read ALL form values BEFORE FileReader starts
    var docName  = document.getElementById('docName')        ? document.getElementById('docName').value.trim()        : '';
    var docCat   = document.getElementById('docCategory')    ? document.getElementById('docCategory').value            : '';
    var docDesc  = document.getElementById('docDescription') ? document.getElementById('docDescription').value.trim() : '';
    var fileInput = document.getElementById('docFile');
    var file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

    if (!docName) { showToast('Please enter a document name', 'warning'); return; }
    if (!docCat)  { showToast('Please select a category', 'warning'); return; }
    if (!file)    { showToast('Please select a file to upload', 'warning'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('File too large. Maximum 10MB allowed.', 'error'); return; }

    // Close modal and reset form immediately
    closeModal('uploadModal');
    var form = document.getElementById('documentForm');
    if (form) form.reset();

    var reader = new FileReader();
    reader.onload = function(ev) {
        // Use pre-captured values — NOT document.getElementById (form is already reset)
        var doc = {
            id:          Date.now(),
            name:        docName,
            category:    docCat,
            description: docDesc,
            fileName:    file.name,
            fileType:    file.type || 'application/octet-stream',
            fileSize:    file.size,
            fileData:    ev.target.result,
            uploadedBy:  currentUser ? currentUser.name : 'Unknown',
            uploadedAt:  new Date().toISOString()
        };
        if (!ngoData.documents) ngoData.documents = [];
        ngoData.documents.push(doc);
        saveData();
        // Save to Firebase — but fileData can be large, store without it in Firebase
        var docForFirebase = {
            id:          doc.id,
            name:        doc.name,
            category:    doc.category,
            description: doc.description,
            fileName:    doc.fileName,
            fileType:    doc.fileType,
            fileSize:    doc.fileSize,
            uploadedBy:  doc.uploadedBy,
            uploadedAt:  doc.uploadedAt
        };
        saveRecord('documents', docForFirebase);
        displayDocuments();
        updateDocumentStats();
        showToast('Document uploaded successfully!', 'success');
        addActivity('document', 'Document uploaded: ' + docName);
    };
    reader.readAsDataURL(file);
}

function displayDocuments() {
    const grid = document.getElementById('documentGrid');
    if (!grid) return;
    
    const documents = filterDocuments();
    
    if (documents.length === 0) {
        grid.innerHTML = '<p class="no-data">No documents uploaded yet.</p>';
        updateDocumentStats();
        return;
    }
    
    grid.innerHTML = documents.map(doc => {
        const icon = getFileIcon(doc.fileType);
        const size = formatFileSize(doc.fileSize);
        const date = new Date(doc.uploadedAt).toLocaleDateString();
        
        return `
            <div class="document-card" onclick="openDocument(${doc.id})">
                <div class="document-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">
                    <span>${size}</span>
                    <span>${date}</span>
                </div>
                <div class="document-category">${doc.category}</div>
                <button class="delete-btn small" onclick="deleteDocument(${doc.id}, event)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
    
    updateDocumentStats();
}

function updateDocumentStats() {
    document.getElementById('totalDocuments').textContent = ngoData.documents.length;
    
    const totalSize = ngoData.documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
    document.getElementById('totalSize').textContent = formatFileSize(totalSize);
    
    const lastUpload = ngoData.documents.length > 0 
        ? new Date(ngoData.documents[ngoData.documents.length - 1].uploadedAt).toLocaleDateString()
        : 'Never';
    document.getElementById('lastUpload').textContent = lastUpload;
}

function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('image')) return 'file-image';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'file-excel';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-word';
    return 'file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function searchDocuments() {
    displayDocuments();
}

function filterDocuments() {
    var searchEl = document.getElementById('searchDocuments');
    var searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
    var category = _docActiveCategory || 'all';
    var type = _docActiveType || 'all';
    return (ngoData.documents || []).filter(function(doc) {
        var mSearch = (doc.name||'').toLowerCase().includes(searchTerm)||(doc.description||'').toLowerCase().includes(searchTerm);
        var mCat    = category==='all'||(doc.category||'')===category;
        var mType   = type==='all'||(doc.fileType||'').toLowerCase().includes(type)||(doc.fileName||'').toLowerCase().includes(type);
        return mSearch && mCat && mType;
    });
}

function filterDocumentsByType(type) {
    _docActiveType = type;
    displayDocuments();
}

function filterDocumentsByCategory(category) {
    _docActiveCategory = category;
    document.querySelectorAll('.category-btn').forEach(function(btn){btn.classList.remove('active');});
    if (event && event.target) event.target.classList.add('active');
    displayDocuments();
}

function openDocument(id) {
    var doc = ngoData.documents.find(function(d) { return d.id === id; });
    if (!doc) return;

    if (!doc.fileData) {
        // Sample doc with no real file — show info card
        var win = window.open('', '_blank');
        win.document.write(
            '<html><head><title>' + doc.name + '</title></head>' +
            '<body style="margin:0;padding:30px;font-family:Arial;background:#f5f5f5">' +
            '<div style="background:#fff;border-radius:10px;padding:28px;max-width:600px;margin:auto;box-shadow:0 2px 12px rgba(0,0,0,0.1)">' +
            '<h2 style="color:#2c3e50;margin-top:0">' + doc.name + '</h2>' +
            '<p style="color:#666">' + (doc.description || '') + '</p>' +
            '<hr>' +
            '<p><strong>Category:</strong> ' + doc.category + '</p>' +
            '<p><strong>Uploaded by:</strong> ' + doc.uploadedBy + '</p>' +
            '<p><strong>Date:</strong> ' + new Date(doc.uploadedAt).toLocaleString('en-IN') + '</p>' +
            '<p><strong>Size:</strong> ' + formatFileSize(doc.fileSize) + '</p>' +
            '<p style="color:#e74c3c;margin-top:20px">No file attached to this document.</p>' +
            '</div></body></html>'
        );
        return;
    }

    var fileType = doc.fileType || '';

    // PDF — embed directly
    if (fileType.includes('pdf')) {
        var win = window.open('', '_blank');
        win.document.write(
            '<html><head><title>' + doc.name + '</title></head>' +
            '<body style="margin:0;padding:0">' +
            '<iframe src="' + doc.fileData + '" width="100%" height="100%" style="border:none;position:fixed;top:0;left:0;width:100%;height:100%"></iframe>' +
            '</body></html>'
        );
        return;
    }

    // Image — show in page
    if (fileType.includes('image')) {
        var win = window.open('', '_blank');
        win.document.write(
            '<html><head><title>' + doc.name + '</title></head>' +
            '<body style="margin:0;padding:20px;background:#111;text-align:center">' +
            '<p style="color:#fff;font-family:Arial;margin-bottom:10px">' + doc.name + '</p>' +
            '<img src="' + doc.fileData + '" style="max-width:100%;max-height:90vh;border-radius:6px">' +
            '</body></html>'
        );
        return;
    }

    // Excel / Word / other — trigger download
    var a = document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.name;
    a.click();
}

function deleteDocument(id, event) {
    event.stopPropagation();
    if (confirm('Delete this document?')) {
        ngoData.documents = ngoData.documents.filter(d => d.id !== id);
        saveData();
        displayDocuments();
        showToast('Document deleted', 'warning');
    }
}

// ============================================
// BENEFICIARY FUNCTIONS
// ============================================

function showAddBeneficiaryModal() {
    const programSelect = document.getElementById('modalBeneficiaryProgram');
    if (programSelect) {
        programSelect.innerHTML = '<option value="">None (General)</option>';
        (ngoData.programs || []).forEach(p => {
            programSelect.innerHTML += `<option value="${p.name}">${p.name}</option>`;
        });
    }
    
    document.getElementById('modalBeneficiaryName').value = '';
    document.getElementById('modalBeneficiaryContact').value = '';
    document.getElementById('modalBeneficiaryEmail').value = '';
    document.getElementById('modalBeneficiaryAddress').value = '';
    document.getElementById('modalBeneficiaryType').value = 'individual';
    document.getElementById('modalBeneficiaryProgram').value = '';
    document.getElementById('modalBeneficiaryNotes').value = '';
    
    document.getElementById('beneficiaryModal').classList.add('show');
}

function saveBeneficiaryFromModal() {
    const name = document.getElementById('modalBeneficiaryName').value;
    if (!name) {
        showToast('Name is required!', 'warning');
        return;
    }
    
    const beneficiary = {
        id: Date.now(),
        name: name,
        contact: document.getElementById('modalBeneficiaryContact').value || '',
        email: document.getElementById('modalBeneficiaryEmail').value || '',
        address: document.getElementById('modalBeneficiaryAddress').value || '',
        type: document.getElementById('modalBeneficiaryType').value,
        program: document.getElementById('modalBeneficiaryProgram').value || '',
        notes: document.getElementById('modalBeneficiaryNotes').value || '',
        dateAdded: new Date().toISOString()
    };
    
    ngoData.beneficiaries.push(beneficiary);
    saveRecord('beneficiaries', beneficiary); // ✅ Firebase
    displayBeneficiaries();
    
    closeModal('beneficiaryModal');
    showToast('Beneficiary added successfully!', 'success');
    addActivity('beneficiary', `New beneficiary added: ${name}`);
}

function displayBeneficiaries() {
    const grid = document.getElementById('beneficiaryGrid');
    if (!grid) return;
    
    const beneficiaries = filterBeneficiaries();
    
    document.getElementById('beneficiaryCount').textContent = beneficiaries.length;
    
    const thisMonth = beneficiaries.filter(b => {
        const date = new Date(b.dateAdded);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    document.getElementById('beneficiaryMonthly').textContent = thisMonth;
    
    if (beneficiaries.length === 0) {
        grid.innerHTML = '<p class="no-data">No beneficiaries added yet.</p>';
        return;
    }
    
    grid.innerHTML = beneficiaries.map(b => `
        <div class="beneficiary-card">
            <div class="beneficiary-header">
                <div class="beneficiary-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="beneficiary-info">
                    <h4>${b.name}</h4>
                    <small>ID: #${b.id}</small>
                </div>
            </div>
            <div class="beneficiary-body">
                <div class="beneficiary-detail">
                    <i class="fas fa-phone"></i>
                    <span>${b.contact || 'N/A'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${b.email || 'N/A'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${b.address || 'N/A'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-tag"></i>
                    <span>${b.type || 'Individual'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-calendar"></i>
                    <span>Joined: ${new Date(b.dateAdded).toLocaleDateString()}</span>
                </div>
                ${b.program ? `
                <div class="beneficiary-detail">
                    <i class="fas fa-project-diagram"></i>
                    <span>Program: ${b.program}</span>
                </div>
                ` : ''}
                ${b.notes ? `
                <div class="beneficiary-detail notes">
                    <i class="fas fa-sticky-note"></i>
                    <span class="notes-text">${b.notes}</span>
                </div>
                ` : ''}
            </div>
            <div class="beneficiary-footer">
                <button class="qr-btn" onclick="showBeneficiaryQR(${b.id})">
                    <i class="fas fa-qrcode"></i> QR Code
                </button>
                <button class="delete-btn small" onclick="deleteBeneficiary(${b.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function filterBeneficiaries() {
    const searchTerm = document.getElementById('searchBeneficiary')?.value.toLowerCase() || '';
    const filterType = document.getElementById('filterBeneficiaryType')?.value || 'all';
    
    return ngoData.beneficiaries.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm) ||
                            b.contact?.includes(searchTerm) ||
                            b.email?.toLowerCase().includes(searchTerm) ||
                            b.address?.toLowerCase().includes(searchTerm);
        const matchesType = filterType === 'all' || b.type === filterType;
        return matchesSearch && matchesType;
    });
}

function displayFilteredBeneficiaries(beneficiaries) {
    const grid = document.getElementById('beneficiaryGrid');
    if (!grid) return;
    
    if (beneficiaries.length === 0) {
        grid.innerHTML = '<p class="no-data">No beneficiaries found matching your search.</p>';
        document.getElementById('beneficiaryCount').textContent = '0';
        document.getElementById('beneficiaryMonthly').textContent = '0';
        return;
    }
    
    document.getElementById('beneficiaryCount').textContent = beneficiaries.length;
    
    const now = new Date();
    const thisMonth = beneficiaries.filter(b => {
        const date = new Date(b.dateAdded);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    document.getElementById('beneficiaryMonthly').textContent = thisMonth;
    
    grid.innerHTML = beneficiaries.map(b => `
        <div class="beneficiary-card">
            <div class="beneficiary-header">
                <div class="beneficiary-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="beneficiary-info">
                    <h4>${b.name}</h4>
                    <small>ID: #${b.id}</small>
                </div>
            </div>
            <div class="beneficiary-body">
                <div class="beneficiary-detail">
                    <i class="fas fa-phone"></i>
                    <span>${b.contact || 'N/A'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${b.email || 'N/A'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${b.address || 'N/A'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-tag"></i>
                    <span>${b.type || 'Individual'}</span>
                </div>
                <div class="beneficiary-detail">
                    <i class="fas fa-calendar"></i>
                    <span>Joined: ${new Date(b.dateAdded).toLocaleDateString()}</span>
                </div>
                ${b.program ? `
                <div class="beneficiary-detail">
                    <i class="fas fa-project-diagram"></i>
                    <span>Program: ${b.program}</span>
                </div>
                ` : ''}
                ${b.notes ? `
                <div class="beneficiary-detail notes">
                    <i class="fas fa-sticky-note"></i>
                    <span class="notes-text">${b.notes}</span>
                </div>
                ` : ''}
            </div>
            <div class="beneficiary-footer">
                <button class="qr-btn" onclick="showBeneficiaryQR(${b.id})">
                    <i class="fas fa-qrcode"></i> QR Code
                </button>
                <button class="delete-btn small" onclick="deleteBeneficiary(${b.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function searchBeneficiaries() {
    const searchTerm = document.getElementById('searchBeneficiary')?.value.toLowerCase() || '';
    const filterType = document.getElementById('filterBeneficiaryType')?.value || 'all';
    
    const filtered = ngoData.beneficiaries.filter(b => {
        const matchesSearch = 
            (b.name && b.name.toLowerCase().includes(searchTerm)) ||
            (b.contact && b.contact.toLowerCase().includes(searchTerm)) ||
            (b.email && b.email.toLowerCase().includes(searchTerm)) ||
            (b.address && b.address.toLowerCase().includes(searchTerm));
            
        const matchesType = filterType === 'all' || b.type === filterType;
        
        return matchesSearch && matchesType;
    });
    
    displayFilteredBeneficiaries(filtered);
}

function showBeneficiaryQR(id) {
    const beneficiary = ngoData.beneficiaries.find(b => b.id === id);
    if (!beneficiary) return;
    
    const qrContainer = document.getElementById('qrCode');
    if (qrContainer) {
        qrContainer.innerHTML = '';
        
        const qrData = JSON.stringify({
            id: beneficiary.id,
            name: beneficiary.name,
            contact: beneficiary.contact,
            type: beneficiary.type
        });
        
        new QRCode(qrContainer, {
            text: qrData,
            width: 200,
            height: 200
        });
    }
    
    document.getElementById('qrInfo').textContent = `Beneficiary: ${beneficiary.name}`;
    document.getElementById('qrModal')?.classList.add('show');
}

function scanQRCode() {
    if (ngoData.beneficiaries.length === 0) {
        showToast('No beneficiaries to scan. Add some first!', 'warning');
        return;
    }
    
    const firstBeneficiary = ngoData.beneficiaries[0];
    showBeneficiaryQR(firstBeneficiary.id);
    showToast('QR Scanner - Showing first beneficiary QR for demo', 'info');
}

function printQR() {
    window.print();
}

function deleteBeneficiary(id) {
    if (confirm('Are you sure you want to delete this beneficiary?')) {
        const beneficiary = ngoData.beneficiaries.find(b => b.id === id);
        ngoData.beneficiaries = ngoData.beneficiaries.filter(b => b.id !== id);
        deleteRecord('beneficiaries', id); // ✅ Firebase
        displayBeneficiaries();
        showToast('Beneficiary deleted', 'warning');
        addActivity('beneficiary', `Beneficiary deleted: ${beneficiary?.name}`);
    }
}

// ============================================
// VOLUNTEER FUNCTIONS
// ============================================

function showAddVolunteerModal() {
    const modal = document.getElementById('volunteerModal');
    if (!modal) {
        showToast('Volunteer modal not found', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const joinDateInput = document.getElementById('modalVolunteerJoinDate');
    if (joinDateInput) joinDateInput.value = today;
    
    document.getElementById('modalVolunteerName').value = '';
    document.getElementById('modalVolunteerEmail').value = '';
    document.getElementById('modalVolunteerPhone').value = '';
    if (joinDateInput) joinDateInput.value = today;
    
    const skillsSelect = document.getElementById('modalVolunteerSkills');
    if (skillsSelect) {
        Array.from(skillsSelect.options).forEach(option => option.selected = false);
    }
    
    document.getElementById('modalVolunteerAvailability').value = 'flexible';
    document.getElementById('modalVolunteerEmergency').value = '';
    document.getElementById('modalVolunteerStatus').value = 'active';
    document.getElementById('modalVolunteerNotes').value = '';
    
    modal.classList.add('show');
}

function saveVolunteerFromModal() {
    const name = document.getElementById('modalVolunteerName')?.value;
    if (!name) {
        showToast('Name is required!', 'warning');
        return;
    }
    
    const email = document.getElementById('modalVolunteerEmail')?.value;
    const phone = document.getElementById('modalVolunteerPhone')?.value;
    
    const skillsSelect = document.getElementById('modalVolunteerSkills');
    const skills = skillsSelect ? Array.from(skillsSelect.selectedOptions).map(o => o.value) : [];
    
    const volunteer = {
        id: Date.now(),
        name: name,
        email: email || '',
        phone: phone || '',
        joinDate: document.getElementById('modalVolunteerJoinDate')?.value || new Date().toISOString().split('T')[0],
        skills: skills,
        availability: document.getElementById('modalVolunteerAvailability')?.value || 'flexible',
        emergencyContact: document.getElementById('modalVolunteerEmergency')?.value || '',
        status: document.getElementById('modalVolunteerStatus')?.value || 'active',
        notes: document.getElementById('modalVolunteerNotes')?.value || '',
        hoursLogged: 0,
        tasksCompleted: 0
    };
    
    ngoData.volunteers.push(volunteer);
    saveRecord('volunteers', volunteer); // ✅ Firebase
    displayVolunteers();
    
    closeModal('volunteerModal');
    showToast('Volunteer added successfully!', 'success');
    addActivity('volunteer', `New volunteer added: ${name}`);
}

function displayVolunteers() {
    const container = document.getElementById('volunteerList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchVolunteer')?.value.toLowerCase() || '';
    const filterStatus = document.getElementById('filterVolunteerStatus')?.value || 'all';
    
    let filtered = ngoData.volunteers || [];
    
    if (searchTerm) {
        filtered = filtered.filter(v => 
            (v.name && v.name.toLowerCase().includes(searchTerm)) ||
            (v.email && v.email.toLowerCase().includes(searchTerm)) ||
            (v.phone && v.phone.includes(searchTerm))
        );
    }
    
    if (filterStatus !== 'all') {
        filtered = filtered.filter(v => v.status === filterStatus);
    }
    
    document.getElementById('totalVolunteers').textContent = (ngoData.volunteers || []).length;
    document.getElementById('activeVolunteers').textContent = (ngoData.volunteers || []).filter(v => v.status === 'active').length;
    
    const totalHours = (ngoData.volunteers || []).reduce((sum, v) => sum + (v.hoursLogged || 0), 0);
    document.getElementById('volunteerHours').textContent = totalHours;
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No volunteers found.</p>';
        return;
    }
    
    container.innerHTML = filtered.map(v => `
        <div class="volunteer-card">
            <div class="volunteer-header">
                <div class="volunteer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="volunteer-info">
                    <h4>${v.name}</h4>
                    <p><i class="fas fa-envelope"></i> ${v.email || 'N/A'}</p>
                    <p><i class="fas fa-phone"></i> ${v.phone || 'N/A'}</p>
                </div>
            </div>
            <div class="volunteer-badge badge-${v.status}">${v.status}</div>
            <div class="volunteer-skills">
                ${(v.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                ${(!v.skills || v.skills.length === 0) ? '<span class="skill-tag">No skills listed</span>' : ''}
            </div>
            <div class="volunteer-footer">
                <span><i class="fas fa-clock"></i> ${v.hoursLogged || 0} hours</span>
                <span><i class="fas fa-check-circle"></i> ${v.tasksCompleted || 0} tasks</span>
                <button class="delete-btn" onclick="deleteVolunteer(${v.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteVolunteer(id) {
    if (confirm('Are you sure you want to delete this volunteer?')) {
        const volunteer = ngoData.volunteers.find(v => v.id === id);
        ngoData.volunteers = ngoData.volunteers.filter(v => v.id !== id);
        deleteRecord('volunteers', id); // ✅ Firebase
        displayVolunteers();
        showToast('Volunteer deleted', 'warning');
        addActivity('volunteer', `Volunteer deleted: ${volunteer?.name}`);
    }
}

function searchVolunteers() {
    displayVolunteers();
}

function exportVolunteers() {
    if ((ngoData.volunteers || []).length === 0) {
        showToast('No volunteers to export', 'warning');
        return;
    }
    
    const data = ngoData.volunteers.map(v => ({
        Name: v.name,
        Email: v.email || '',
        Phone: v.phone || '',
        'Join Date': new Date(v.joinDate).toLocaleDateString(),
        Skills: (v.skills || []).join(', '),
        Availability: v.availability || '',
        Status: v.status,
        'Hours Logged': v.hoursLogged || 0,
        'Tasks Completed': v.tasksCompleted || 0,
        Notes: v.notes || ''
    }));
    
    exportToCSV(data, 'volunteers.csv');
    showToast('Volunteers exported', 'success');
}

function hideVolunteerForm() {
    document.getElementById('volunteerFormContainer').style.display = 'none';
    document.getElementById('volunteerForm').reset();
}

// ============================================
// DONATION FUNCTIONS
// ============================================

function showAddDonationModal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('modalDonationDate').value = today;
    
    const programSelect = document.getElementById('modalDonationProgram');
    programSelect.innerHTML = '<option value="">General Fund</option>';
    (ngoData.programs || []).forEach(p => {
        programSelect.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    });
    
    document.getElementById('modalDonorName').value = '';
    document.getElementById('modalDonationAmount').value = '';
    document.getElementById('modalDonationType').value = 'cash';
    document.getElementById('modalDonorPhone').value = '';
    document.getElementById('modalDonorEmail').value = '';
    document.getElementById('modalDonationNotes').value = '';
    document.getElementById('modalGenerateReceipt').checked = true;
    
    document.getElementById('donationModal').classList.add('show');
}

function displayDonations() {
    const container = document.getElementById('donationList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchDonation')?.value.toLowerCase() || '';
    const filterMonth = document.getElementById('filterDonationMonth')?.value || '';
    
    let filtered = ngoData.donations || [];
    
    if (searchTerm) {
        filtered = filtered.filter(d => 
            (d.donorName && d.donorName.toLowerCase().includes(searchTerm)) ||
            (d.notes && d.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filterMonth) {
        filtered = filtered.filter(d => d.date && d.date.substring(0, 7) === filterMonth);
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No donations found.</p>';
        updateDonationStats();
        return;
    }
    
    container.innerHTML = filtered.map(d => `
        <div class="donation-card">
            <div class="donation-header">
                <h4><i class="fas fa-user"></i> ${d.donorName}</h4>
                <span class="donation-amount">₹${d.amount.toFixed(2)}</span>
            </div>
            <div class="donation-details">
                <span><i class="fas fa-calendar"></i> ${new Date(d.date).toLocaleDateString()}</span>
                <span><i class="fas fa-tag"></i> ${d.type}</span>
                <span><i class="fas fa-project-diagram"></i> ${d.program || 'General'}</span>
                ${d.donorPhone ? `<span><i class="fas fa-phone"></i> ${d.donorPhone}</span>` : ''}
                ${d.donorEmail ? `<span><i class="fas fa-envelope"></i> ${d.donorEmail}</span>` : ''}
            </div>
            ${d.notes ? `<div class="donation-notes"><i class="fas fa-sticky-note"></i> ${d.notes}</div>` : ''}
            <div class="donation-actions">
                <button class="btn-receipt" onclick="showReceipt(${d.id})">
                    <i class="fas fa-receipt"></i> Receipt
                </button>
                <button class="btn-edit" onclick="editDonation(${d.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteDonation(${d.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    updateDonationStats();
}

function updateDonationStats() {
    const donations = ngoData.donations || [];
    const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    document.getElementById('totalDonationsAmount').textContent = formatCurrency(total);
    
    const now = new Date();
    const thisMonth = donations.filter(d => {
        const date = new Date(d.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, d) => sum + (d.amount || 0), 0);
    document.getElementById('monthlyDonations').textContent = formatCurrency(thisMonth);
    
    const avg = donations.length > 0 ? total / donations.length : 0;
    document.getElementById('averageDonation').textContent = formatCurrency(avg);
    
    const donorTotals = {};
    donations.forEach(d => {
        if (d.donorName) {
            donorTotals[d.donorName] = (donorTotals[d.donorName] || 0) + (d.amount || 0);
        }
    });
    
    let topDonor = '-';
    let topAmount = 0;
    for (const [donor, amount] of Object.entries(donorTotals)) {
        if (amount > topAmount) {
            topAmount = amount;
            topDonor = donor;
        }
    }
    document.getElementById('topDonor').textContent = topDonor;
}

function updateDonationTimeline() {
    const timeline = document.getElementById('donationTimeline');
    if (!timeline) return;
    
    const donations = ngoData.donations || [];
    const sorted = [...donations].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    
    if (sorted.length === 0) {
        timeline.innerHTML = '<p class="no-data">No donations yet</p>';
        return;
    }
    
    timeline.innerHTML = sorted.map(d => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">${new Date(d.date).toLocaleDateString()}</div>
                <div class="timeline-title">${d.donorName}</div>
                <div class="timeline-amount">${formatCurrency(d.amount)}</div>
                <small>${d.type} • ${d.program || 'General'}</small>
            </div>
        </div>
    `).join('');
}

function generateReceipt() {
    if ((ngoData.donations || []).length === 0) {
        showToast('No donations to generate receipt for', 'warning');
        return;
    }
    const latestDonation = ngoData.donations[ngoData.donations.length - 1];
    showReceipt(latestDonation.id);
}

function showReceipt(donationId) {
    const donation = ngoData.donations.find(d => d.id === donationId);
    if (!donation) return;
    
    const receiptContainer = document.getElementById('receiptContent');
    const receiptNumber = `DON-${donation.id}`;
    const date = new Date(donation.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    receiptContainer.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <i class="fas fa-heart" style="font-size: 40px; color: var(--primary-color);"></i>
                <h2>${ngoData.settings.organizationName}</h2>
                <p>${ngoData.settings.organizationAddress}</p>
                <p>${ngoData.settings.organizationEmail} | ${ngoData.settings.organizationPhone}</p>
            </div>
            <div class="receipt-body">
                <h3 style="text-align: center; margin-bottom: 20px;">DONATION RECEIPT</h3>
                <div class="receipt-row">
                    <span>Receipt No:</span>
                    <strong>${receiptNumber}</strong>
                </div>
                <div class="receipt-row">
                    <span>Date:</span>
                    <strong>${date}</strong>
                </div>
                <div class="receipt-row">
                    <span>Donor Name:</span>
                    <strong>${donation.donorName}</strong>
                </div>
                ${donation.donorPhone ? `
                <div class="receipt-row">
                    <span>Phone:</span>
                    <strong>${donation.donorPhone}</strong>
                </div>
                ` : ''}
                ${donation.donorEmail ? `
                <div class="receipt-row">
                    <span>Email:</span>
                    <strong>${donation.donorEmail}</strong>
                </div>
                ` : ''}
                <div class="receipt-row">
                    <span>Donation Type:</span>
                    <strong>${donation.type}</strong>
                </div>
                <div class="receipt-row">
                    <span>Program:</span>
                    <strong>${donation.program || 'General Fund'}</strong>
                </div>
                <div class="receipt-row total">
                    <span>Amount:</span>
                    <strong>${formatCurrency(donation.amount)}</strong>
                </div>
                ${donation.notes ? `
                <div class="receipt-row">
                    <span>Notes:</span>
                    <strong>${donation.notes}</strong>
                </div>
                ` : ''}
            </div>
            <div class="receipt-footer">
                <div class="thank-you">Thank you for your generosity!</div>
                <p>This is a computer generated receipt. No signature required.</p>
                <p>Your contribution is tax-deductible to the extent allowed by law.</p>
            </div>
        </div>
    `;
    
    document.getElementById('viewReceiptModal').classList.add('show');
}

function printReceipt() {
    window.print();
}

function downloadReceipt() {
    const receipt = document.getElementById('receiptContent')?.innerHTML;
    if (!receipt) return;
    
    const style = `
        <style>
            body { font-family: Arial; padding: 40px; }
            .receipt { max-width: 500px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
            .receipt-header { text-align: center; margin-bottom: 30px; }
            .receipt-logo { font-size: 40px; color: #27ae60; }
            .receipt-details { margin-bottom: 30px; }
            .receipt-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .receipt-footer { text-align: center; font-size: 12px; color: #666; }
        </style>
    `;
    
    const win = window.open();
    win.document.write(style + receipt);
    win.print();
}

function printCurrentReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Donation Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .receipt { max-width: 600px; margin: 0 auto; }
                    .receipt-header { text-align: center; margin-bottom: 30px; }
                    .receipt-row { display: flex; justify-content: space-between; margin: 10px 0; }
                    .receipt-footer { text-align: center; margin-top: 30px; font-size: 12px; }
                </style>
            </head>
            <body>${receiptContent}</body>
        </html>
    `);
    printWindow.print();
}

function downloadCurrentReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerText;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${Date.now()}.txt`;
    a.click();
}

function saveDonationFromModal() {
    const donorName = document.getElementById('modalDonorName').value;
    const amount = document.getElementById('modalDonationAmount').value;
    
    if (!donorName || !amount) {
        showToast('Donor name and amount are required!', 'warning');
        return;
    }
    
    const donation = {
        id: Date.now(),
        donorName: donorName,
        amount: parseFloat(amount),
        date: document.getElementById('modalDonationDate').value,
        type: document.getElementById('modalDonationType').value,
        program: document.getElementById('modalDonationProgram').value || '',
        donorPhone: document.getElementById('modalDonorPhone').value || '',
        donorEmail: document.getElementById('modalDonorEmail').value || '',
        notes: document.getElementById('modalDonationNotes').value || '',
        receiptGenerated: document.getElementById('modalGenerateReceipt').checked
    };
    
    if (!ngoData.donations) ngoData.donations = [];
    ngoData.donations.push(donation);
    saveRecord('donations', donation); // ✅ Firebase
    displayDonations();
    
    closeModal('donationModal');
    
    if (donation.receiptGenerated) {
        showReceipt(donation.id);
    }
    
    showToast('Donation recorded successfully!', 'success');
    addActivity('donation', `Donation of $${amount} from ${donorName}`);
}

function editDonation(id) {
    const donation = ngoData.donations.find(d => d.id === id);
    if (!donation) return;
    
    document.getElementById('modalDonorName').value = donation.donorName;
    document.getElementById('modalDonationAmount').value = donation.amount;
    document.getElementById('modalDonationDate').value = donation.date;
    document.getElementById('modalDonationType').value = donation.type;
    document.getElementById('modalDonationProgram').value = donation.program || '';
    document.getElementById('modalDonorPhone').value = donation.donorPhone || '';
    document.getElementById('modalDonorEmail').value = donation.donorEmail || '';
    document.getElementById('modalDonationNotes').value = donation.notes || '';
    document.getElementById('modalGenerateReceipt').checked = false;
    
    ngoData.donations = ngoData.donations.filter(d => d.id !== id);
    
    document.getElementById('donationModal').classList.add('show');
    showToast('Edit the donation and save', 'info');
}

function searchDonations() {
    displayDonations();
}

function deleteDonation(id) {
    if (confirm('Are you sure you want to delete this donation?')) {
        const donation = ngoData.donations.find(d => d.id === id);
        ngoData.donations = ngoData.donations.filter(d => d.id !== id);
        deleteRecord('donations', id); // ✅ Firebase
        displayDonations();
        showToast('Donation deleted', 'warning');
        addActivity('donation', `Donation deleted: ${donation?.donorName} - ${formatCurrency(donation?.amount)}`);
    }
}

// ============================================
// COMMUNICATIONS FUNCTIONS
// ============================================

function updateMessageRecipients() {
    const recipientSelect = document.getElementById('messageRecipient');
    if (!recipientSelect) return;
    
    while (recipientSelect.options.length > 1) {
        recipientSelect.remove(1);
    }
    
    (ngoData.volunteers || []).forEach(v => {
        const option = document.createElement('option');
        option.value = v.name;
        option.textContent = `${v.name} (Volunteer)`;
        recipientSelect.appendChild(option);
    });
    
    (ngoData.users || []).forEach(u => {
        if (u.name !== currentUser?.name) {
            const option = document.createElement('option');
            option.value = u.name;
            option.textContent = `${u.name} (${u.role})`;
            recipientSelect.appendChild(option);
        }
    });
}

function handleSendMessage(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('messageRecipient').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    
    if (!recipient || !subject || !content) {
        showToast('All fields are required!', 'warning');
        return;
    }
    
    const message = {
        id: Date.now(),
        sender: currentUser.name,
        senderId: currentUser.id,
        recipient: recipient,
        subject: subject,
        content: content,
        timestamp: new Date().toISOString(),
        read: false,
        starred: false
    };
    
    if (!ngoData.messages) ngoData.messages = [];
    ngoData.messages.push(message);
    saveData();
    displayMessages();
    document.getElementById('messageForm').reset();
    showToast('Message sent', 'success');
    addActivity('message', `Message sent to ${recipient}`);
}


// ================================================
// SEND MESSAGE
// ================================================
function sendMessage(e) {
    if (e) e.preventDefault();
    if (!currentUser || currentUser.role !== 'super_admin') {
        showToast('Only Super Admin can perform this action', 'error');
        return;
    }
    var recipient = document.getElementById('messageRecipient') ? document.getElementById('messageRecipient').value : 'all';
    var subject   = (document.getElementById('messageSubject')  ? document.getElementById('messageSubject').value  : '').trim();
    var content   = (document.getElementById('messageContent')  ? document.getElementById('messageContent').value  : '').trim();
    if (!recipient) { showToast('Please select a recipient', 'warning'); return; }
    if (!subject)   { showToast('Please enter a subject', 'warning'); return; }
    if (!content)   { showToast('Please enter a message', 'warning'); return; }
    var msg = {
        id:        Date.now(),
        sender:    currentUser ? currentUser.name : 'Unknown',
        senderRole:currentUser ? currentUser.role : '',
        recipient: recipient,
        subject:   subject,
        content:   content,
        timestamp: new Date().toISOString(),
        read:      false,
        priority:  'normal'
    };
    if (!ngoData.messages) ngoData.messages = [];
    ngoData.messages.push(msg);
    saveData();
    saveRecord('messages', msg);
    displayMessages();
    updateNotificationBadge();
    addActivity('communication', 'Message sent: ' + subject);
    showToast('Message sent successfully!', 'success');
    var form = document.getElementById('messageForm');
    if (form) form.reset();
}

// ================================================
// SEND ANNOUNCEMENT
// ================================================
function sendAnnouncement(e) {
    if (e) e.preventDefault();
    if (!currentUser || currentUser.role !== 'super_admin') {
        showToast('Only Super Admin can perform this action', 'error');
        return;
    }
    var title    = (document.getElementById('announcementTitle')   ? document.getElementById('announcementTitle').value   : '').trim();
    var content  = (document.getElementById('announcementContent') ? document.getElementById('announcementContent').value : '').trim();
    var audience = document.getElementById('announcementAudience') ? document.getElementById('announcementAudience').value : 'all';
    if (!title)   { showToast('Please enter a title', 'warning'); return; }
    if (!content) { showToast('Please enter content', 'warning'); return; }
    var ann = {
        id:        Date.now(),
        title:     title,
        content:   content,
        audience:  audience,
        priority:  'normal',
        postedBy:  currentUser ? currentUser.name : 'Unknown',
        timestamp: new Date().toISOString()
    };
    if (!ngoData.announcements) ngoData.announcements = [];
    ngoData.announcements.push(ann);
    saveData();
    saveRecord('announcements', ann);
    displayAnnouncements();
    addActivity('communication', 'Announcement posted: ' + title);
    showToast('Announcement posted!', 'success');
    var form = document.getElementById('announcementForm');
    if (form) form.reset();
}


function updateCommsFormVisibility() {
    var isAdmin = currentUser && currentUser.role === 'super_admin';
    var els = [
        document.querySelector('.message-compose'),
        document.querySelector('.announcement-compose'),
        document.querySelector('.newsletter-compose')
    ];
    els.forEach(function(el) {
        if (el) el.style.display = isAdmin ? '' : 'none';
    });
}

function displayMessages() {
    var list = document.getElementById('messageList');
    if (!list) return;

    var myName  = currentUser ? currentUser.name : '';
    var isAdmin = currentUser && currentUser.role === 'super_admin';
    var all     = ngoData.messages || [];

    // Each user sees: messages sent TO them, messages sent to 'all', and messages they SENT
    // Admin sees everything
    var visible = all.filter(function(m) {
        return isAdmin
            || m.recipient === 'all'
            || m.recipient === myName
            || m.sender    === myName;
    }).slice().reverse();

    if (visible.length === 0) {
        list.innerHTML = '<p class="no-data">No messages in your inbox</p>';
        return;
    }

    list.innerHTML = visible.map(function(m) {
        var isSent   = (m.sender === myName);
        var isUnread = !m.read && !isSent;
        var badge    = isSent
            ? '<span style="font-size:11px;background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">Sent</span>'
            : (isUnread ? '<span style="font-size:11px;background:#e74c3c;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">New</span>' : '');
        var fromTo   = isSent ? 'To: ' + m.recipient : 'From: ' + m.sender;
        return '<div class="message-item ' + (isUnread ? 'unread' : '') + '" onclick="openMessage(' + m.id + ')" style="cursor:pointer">'
            + '<div class="message-avatar"><i class="fas fa-' + (isSent ? 'paper-plane' : 'envelope') + '"></i></div>'
            + '<div class="message-content">'
            + '<div class="message-header">'
            + '<span class="message-sender">' + fromTo + badge + '</span>'
            + '<span class="message-time">' + timeAgo(m.timestamp) + '</span>'
            + '</div>'
            + '<div class="message-subject">' + m.subject + '</div>'
            + '<div class="message-preview">' + m.content.substring(0, 80) + '...</div>'
            + '</div></div>';
    }).join('');
}

function openMessage(id) {
    var msg = (ngoData.messages || []).find(function(m) { return m.id === id; });
    if (!msg) return;

    var myName = currentUser ? currentUser.name : '';
    var isSent = (msg.sender === myName);

    // Only mark as read when RECIPIENT opens it (not when sender views their own sent message)
    if (!isSent && !msg.read) {
        msg.read = true;
        saveData();
        // Update read:true in Firebase so admin can see it was read
        fbSave('messages', {
            id:         msg.id,
            sender:     msg.sender,
            senderRole: msg.senderRole || '',
            recipient:  msg.recipient,
            subject:    msg.subject,
            content:    msg.content,
            timestamp:  msg.timestamp,
            read:       true,
            priority:   msg.priority || 'normal'
        });
        displayMessages();
        updateNotificationBadge();
    }

    // Show message popup
    var popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center';

    var inner = document.createElement('div');
    inner.style.cssText = 'background:#fff;border-radius:12px;padding:28px;max-width:520px;width:94%;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-height:80vh;overflow-y:auto';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px';
    var titleEl = document.createElement('h3');
    titleEl.style.cssText = 'color:#2c3e50;margin:0;font-size:18px;flex:1';
    titleEl.textContent = msg.subject;
    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:none;border:none;font-size:24px;cursor:pointer;color:#aaa;margin-left:12px';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() { popup.remove(); });
    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Body
    var readStatus = msg.read
        ? '<span style="font-size:12px;background:#27ae60;color:#fff;padding:2px 10px;border-radius:10px;margin-left:8px">Read</span>'
        : '<span style="font-size:12px;background:#e74c3c;color:#fff;padding:2px 10px;border-radius:10px;margin-left:8px">Unread</span>';

    var body = document.createElement('div');
    body.innerHTML =
        '<p style="margin:4px 0;color:#555;font-size:13px"><strong>From:</strong> ' + msg.sender + '</p>'
        + '<p style="margin:4px 0;color:#555;font-size:13px"><strong>To:</strong> ' + msg.recipient + readStatus + '</p>'
        + '<p style="margin:4px 0 16px;color:#555;font-size:13px"><strong>Time:</strong> ' + new Date(msg.timestamp).toLocaleString('en-IN') + '</p>'
        + '<hr style="border:none;border-top:1px solid #eee;margin-bottom:16px">'
        + '<p style="color:#444;line-height:1.8;white-space:pre-wrap;font-size:14px">' + msg.content + '</p>';

    inner.appendChild(header);
    inner.appendChild(body);
    popup.appendChild(inner);
    popup.addEventListener('click', function(e) { if (e.target === popup) popup.remove(); });
    document.body.appendChild(popup);
}

function handleAddAnnouncement(e) {
    e.preventDefault();
    
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const audience = document.getElementById('announcementAudience').value;
    
    if (!title || !content) {
        showToast('Title and content are required!', 'warning');
        return;
    }
    
    const announcement = {
        id: Date.now(),
        title: title,
        content: content,
        audience: audience || 'all',
        postedBy: currentUser.name,
        timestamp: new Date().toISOString()
    };
    
    if (!ngoData.announcements) ngoData.announcements = [];
    ngoData.announcements.push(announcement);
    saveData();
    displayAnnouncements();
    document.getElementById('announcementForm').reset();
    showToast('Announcement posted', 'success');
    addActivity('announcement', `Announcement: ${title}`);
}

function displayAnnouncements() {
    var list = document.getElementById('announcementList');
    if (!list) return;

    var role = currentUser ? currentUser.role : 'guest';

    // Role groups — based on exact role values in this system
    var ADMIN_ROLES     = ['super_admin', 'executive_director', 'board_member'];
    var VOLUNTEER_ROLES = ['volunteer_manager', 'field_staff', 'outreach_worker', 'program_coordinator'];
    var STAFF_ROLES     = ['finance_manager', 'accountant', 'program_manager', 'hr_manager', 'auditor'];
    var DONOR_ROLES     = ['finance_manager', 'accountant', 'executive_director', 'super_admin']; // staff who manage donors

    var isAdmin     = ADMIN_ROLES.indexOf(role) >= 0;
    var isVolunteer = VOLUNTEER_ROLES.indexOf(role) >= 0;
    var isStaff     = STAFF_ROLES.indexOf(role) >= 0;
    var isDonorMgr  = DONOR_ROLES.indexOf(role) >= 0;

    var all = (ngoData.announcements || []).slice().reverse();

    var visible = all.filter(function(a) {
        var aud = a.audience || 'all';
        if (aud === 'all')        return true;                              // Everyone sees it
        if (isAdmin)              return true;                              // Admin sees everything
        if (aud === 'volunteers') return isVolunteer || isAdmin;            // Volunteer group
        if (aud === 'staff')      return isStaff || isAdmin;               // Staff group
        if (aud === 'donors')     return isDonorMgr;                       // Donor managers
        return false;
    });

    if (visible.length === 0) {
        list.innerHTML = '<p class="no-data">No announcements for you</p>';
        return;
    }

    list.innerHTML = visible.map(function(a) {
        var color = a.priority === 'high' ? '#e74c3c' : '#3498db';
        var badge = a.priority === 'high' ? 'Important' : 'General';
        var aud   = a.audience || 'all';
        var forLabel = aud === 'volunteers' ? '👥 Volunteers'
                     : aud === 'staff'      ? '🏢 Staff'
                     : aud === 'donors'     ? '💛 Donors'
                     : '📢 Everyone';

        return '<div style="background:#fff;border-radius:10px;padding:18px;margin-bottom:14px;'
            + 'border-left:4px solid ' + color + ';box-shadow:0 2px 8px rgba(0,0,0,0.07)">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
            + '<strong style="color:#2c3e50;font-size:15px">' + a.title + '</strong>'
            + '<span style="font-size:11px;background:' + color + ';color:#fff;padding:3px 10px;border-radius:10px;margin-left:8px;white-space:nowrap">' + badge + '</span>'
            + '</div>'
            + '<p style="margin:0 0 12px;color:#555;font-size:13px;line-height:1.7">' + a.content + '</p>'
            + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">'
            + '<small style="color:#999">Posted by <strong>' + a.postedBy + '</strong> &nbsp;•&nbsp; ' + timeAgo(a.timestamp) + '</small>'
            + '<span style="font-size:11px;background:#f0f0f0;color:#666;padding:2px 10px;border-radius:8px">' + forLabel + '</span>'
            + '</div>'
            + '</div>';
    }).join('');
}

function handleSendNewsletter(e) {
    e.preventDefault();
    
    const subject = document.getElementById('newsletterSubject').value;
    const content = document.getElementById('newsletterContent').value;
    
    if (!subject || !content) {
        showToast('Subject and content are required!', 'warning');
        return;
    }
    
    const newsletter = {
        id: Date.now(),
        subject: subject,
        content: content,
        sendTo: {
            volunteers: document.getElementById('sendToVolunteers')?.checked || false,
            donors: document.getElementById('sendToDonors')?.checked || false,
            beneficiaries: document.getElementById('sendToBeneficiaries')?.checked || false
        },
        sentBy: currentUser.name,
        timestamp: new Date().toISOString()
    };
    
    if (!ngoData.newsletters) ngoData.newsletters = [];
    ngoData.newsletters.push(newsletter);
    saveData();
    displayNewsletters();
    document.getElementById('newsletterForm').reset();
    showToast('Newsletter sent', 'success');
    addActivity('newsletter', `Newsletter sent: ${subject}`);
}

function sendNewsletter(e) {
    if (e) e.preventDefault();
    if (!currentUser || currentUser.role !== 'super_admin') {
        showToast('Only Super Admin can perform this action', 'error');
        return;
    }
    var subject  = (document.getElementById('newsletterSubject') ? document.getElementById('newsletterSubject').value : '').trim();
    var content  = (document.getElementById('newsletterContent') ? document.getElementById('newsletterContent').value : '').trim();
    var toVols   = document.getElementById('sendToVolunteers') ? document.getElementById('sendToVolunteers').checked : false;
    var toDonors = document.getElementById('sendToDonors')     ? document.getElementById('sendToDonors').checked     : false;
    if (!subject)             { showToast('Please enter a subject', 'warning'); return; }
    if (!content)             { showToast('Please enter content', 'warning'); return; }
    if (!toVols && !toDonors) { showToast('Please select at least one recipient group', 'warning'); return; }
    var recipients = [];
    if (toVols)   recipients.push('Volunteers');
    if (toDonors) recipients.push('Donors');
    var newsletter = {
        id:         Date.now(),
        subject:    subject,
        content:    content,
        sendTo:     { volunteers: toVols, donors: toDonors },
        recipients: recipients.join(' & '),
        sentBy:     currentUser ? currentUser.name : 'Unknown',
        timestamp:  new Date().toISOString()
    };
    if (!ngoData.newsletters) ngoData.newsletters = [];
    ngoData.newsletters.push(newsletter);
    saveData();
    saveRecord('newsletters', newsletter);
    displayNewsletters();
    addActivity('communication', 'Newsletter sent: ' + subject);
    showToast('Newsletter sent to ' + recipients.join(' & ') + '!', 'success');
    var form = document.getElementById('newsletterForm');
    if (form) form.reset();
}

function displayNewsletters() {
    var list = document.getElementById('newsletterHistory');
    if (!list) return;

    var role = currentUser ? currentUser.role : 'guest';

    // Exact role values in this system
    var ADMIN_ROLES     = ['super_admin', 'executive_director', 'board_member'];
    var VOLUNTEER_ROLES = ['volunteer_manager', 'field_staff', 'outreach_worker', 'program_coordinator'];
    var DONOR_ROLES     = ['finance_manager', 'accountant'];

    var isAdmin     = ADMIN_ROLES.indexOf(role) >= 0;
    var isVolunteer = VOLUNTEER_ROLES.indexOf(role) >= 0;
    var isDonor     = DONOR_ROLES.indexOf(role) >= 0;

    var all = (ngoData.newsletters || []).slice().reverse();

    // Filter: each role sees only newsletters for their group
    var visible = all.filter(function(n) {
        if (isAdmin) return true;
        var s = n.sendTo || {};
        if (isVolunteer && s.volunteers === true) return true;
        if (isDonor     && s.donors     === true) return true;
        return false;
    });

    if (visible.length === 0) {
        list.innerHTML = '<p class="no-data">No newsletters for you</p>';
        return;
    }

    list.innerHTML = visible.map(function(n) {
        var recipients = n.recipients ||
            Object.entries(n.sendTo || {})
                .filter(function(kv) { return kv[1]; })
                .map(function(kv) { return kv[0]; })
                .join(' & ');

        return '<div style="background:#fff;border-radius:10px;padding:18px;margin-bottom:14px;'
            + 'border-left:4px solid #9b59b6;box-shadow:0 2px 8px rgba(0,0,0,0.07)">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
            + '<strong style="color:#2c3e50;font-size:15px">' + n.subject + '</strong>'
            + '<span style="font-size:11px;background:#9b59b6;color:#fff;padding:3px 10px;'
            + 'border-radius:10px;margin-left:8px;white-space:nowrap">Newsletter</span>'
            + '</div>'
            + '<p style="margin:0 0 12px;color:#444;font-size:13px;line-height:1.8;white-space:pre-wrap">'
            + n.content
            + '</p>'
            + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">'
            + '<small style="color:#999">Sent by <strong>' + n.sentBy + '</strong>'
            + ' &nbsp;•&nbsp; ' + timeAgo(n.timestamp) + '</small>'
            + '<span style="font-size:11px;background:#f0f0f0;color:#666;padding:2px 10px;border-radius:8px">'
            + 'To: ' + recipients + '</span>'
            + '</div>'
            + '</div>';
    }).join('');
}

function switchCommsTab(tabName) {
    document.querySelectorAll('.comms-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.comms-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (event) event.target.classList.add('active');
    const tab = document.getElementById(`${tabName}Tab`);
    if (tab) tab.classList.add('active');

    updateCommsFormVisibility();
    if (tabName === 'messages') displayMessages();
    else if (tabName === 'announcements') displayAnnouncements();
    else if (tabName === 'newsletter') displayNewsletters();
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

function updateAnalytics() {
    console.log("Updating analytics...");
    
    const reportsSection = document.getElementById('reports');
    if (!reportsSection || !reportsSection.classList.contains('active')) {
        console.log("Reports section not active, skipping analytics update");
        return;
    }
    
    updateKeyMetrics();
    updateGrowthChart();
    updateDemographicsChart();
    updateImpactMeter();
    updatePredictions();
    
    console.log("Analytics updated successfully");
}

function updateKeyMetrics() {
    const metricsContainer = document.getElementById('keyMetrics');
    if (!metricsContainer) {
        console.log("keyMetrics element not found");
        return;
    }
    
    const totalDonors = new Set((ngoData.donations || []).map(d => d.donorName)).size;
    const totalBeneficiaries = (ngoData.beneficiaries || []).length;
    const totalVolunteers = (ngoData.volunteers || []).length;
    const totalPrograms = (ngoData.programs || []).length;
    const totalHours = (ngoData.volunteers || []).reduce((sum, v) => sum + (v.hoursLogged || 0), 0);
    const totalDonations = (ngoData.donations || []).reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalExpenses = (ngoData.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    
    metricsContainer.innerHTML = `
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div>
                <h4>Total Donors</h4>
                <p>${totalDonors}</p>
            </div>
        </div>
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-hand-holding-heart"></i></div>
            <div>
                <h4>Beneficiaries</h4>
                <p>${totalBeneficiaries}</p>
            </div>
        </div>
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-hands-helping"></i></div>
            <div>
                <h4>Volunteers</h4>
                <p>${totalVolunteers}</p>
            </div>
        </div>
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-project-diagram"></i></div>
            <div>
                <h4>Programs</h4>
                <p>${totalPrograms}</p>
            </div>
        </div>
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-clock"></i></div>
            <div>
                <h4>Volunteer Hours</h4>
                <p>${totalHours}</p>
            </div>
        </div>
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-rupee-sign"></i></div>
            <div>
                <h4>Total Donations</h4>
                <p>${formatCurrency(totalDonations)}</p>
            </div>
        </div>
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            <div>
                <h4>Total Expenses</h4>
                <p>${formatCurrency(totalExpenses)}</p>
            </div>
        </div>
        <div class="stat-card mini">
            <div class="stat-icon"><i class="fas fa-balance-scale"></i></div>
            <div>
                <h4>Net Balance</h4>
                <p>${formatCurrency(totalDonations - totalExpenses)}</p>
            </div>
        </div>
    `;
}

function updateGrowthChart() {
    const canvas = document.getElementById('growthChart');
    if (!canvas) {
        console.log("growthChart canvas not found");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (growthChart) {
        growthChart.destroy();
    }
    
    const months = [];
    const beneficiaryData = [];
    const donationData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));
        
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const monthBeneficiaries = (ngoData.beneficiaries || []).filter(b => 
            b.dateAdded && b.dateAdded.substring(0, 7) === monthStr
        ).length;
        
        const monthDonations = (ngoData.donations || []).filter(d => 
            d.date && d.date.substring(0, 7) === monthStr
        ).reduce((sum, d) => sum + Number(d.amount || 0), 0);
        
        beneficiaryData.push(monthBeneficiaries);
        donationData.push(monthDonations);
    }
    
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'New Beneficiaries',
                data: beneficiaryData,
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y'
            }, {
                label: 'Donations ($)',
                data: donationData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Beneficiaries'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Donation Amount ($)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            }
        }
    });
}

function updateDemographicsChart() {
    const canvas = document.getElementById('demographicsChart');
    if (!canvas) {
        console.log("demographicsChart canvas not found");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (demographicsChart) {
        demographicsChart.destroy();
    }
    
    const types = {};
    (ngoData.beneficiaries || []).forEach(b => {
        const type = b.type || 'Individual';
        types[type] = (types[type] || 0) + 1;
    });
    
    if (Object.keys(types).length === 0) {
        types['No Data'] = 1;
    }
    
    demographicsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(types),
            datasets: [{
                data: Object.values(types),
                backgroundColor: ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function updateImpactMeter() {
    const meter = document.getElementById('impactMeter');
    if (!meter) {
        console.log("impactMeter element not found");
        return;
    }
    
    const totalBeneficiaries = (ngoData.beneficiaries || []).length;
    const totalDonations = (ngoData.donations || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalVolunteers = (ngoData.volunteers || []).length;
    const totalPrograms = (ngoData.programs || []).length;
    
    const score = Math.min(100, Math.round(
        (totalBeneficiaries * 0.3) +
        (Math.min(totalDonations / 1000, 50)) * 0.3 +
        (totalVolunteers * 2) * 0.2 +
        (totalPrograms * 5) * 0.2
    ));
    
    const degrees = (score / 100) * 360;
    
    meter.innerHTML = `
        <div class="meter" style="background: conic-gradient(var(--primary-color) ${degrees}deg, var(--light-color) ${degrees}deg)">
            <span>${score}%</span>
        </div>
        <p style="text-align: center; margin-top: 10px; font-weight: bold;">Impact Score</p>
    `;
}

function updatePredictions() {
    const donations = (ngoData.donations || []).map(d => Number(d.amount || 0));
    const avgDonation = donations.length > 0 
        ? donations.reduce((a, b) => a + b, 0) / donations.length 
        : 0;
    
    const predictedDonations = avgDonation * (donations.length + 2);
    
    const beneficiaries = (ngoData.beneficiaries || []).length;
    const predictedGrowth = beneficiaries > 0 ? Math.round((beneficiaries * 0.15) / beneficiaries * 100) : 15;
    
    const predictedElem = document.getElementById('predictedDonations');
    const growthElem = document.getElementById('predictedGrowth');
    const budgetElem = document.getElementById('budgetStatus');
    
    if (predictedElem) predictedElem.textContent = formatCurrency(predictedDonations);
    if (growthElem) growthElem.textContent = `+${predictedGrowth}%`;
    
    const totalDonations = donations.reduce((a, b) => a + b, 0);
    const totalExpenses = (ngoData.expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const budgetStatus = totalExpenses > totalDonations ? '⚠️ Over Budget' : '✅ On Track';
    if (budgetElem) budgetElem.textContent = budgetStatus;
}

window.addEventListener('resize', function() {
    if (document.getElementById('reports')?.classList.contains('active')) {
        setTimeout(updateAnalytics, 100);
    }
});

// ============================================
// FIXED CHART FUNCTIONS
// ============================================

function destroyAllCharts() {
    if (financialChart) { financialChart.destroy(); financialChart = null; }
    if (donationSourceChart) { donationSourceChart.destroy(); donationSourceChart = null; }
    if (programPerformanceChart) { programPerformanceChart.destroy(); programPerformanceChart = null; }
    if (volunteerHoursChart) { volunteerHoursChart.destroy(); volunteerHoursChart = null; }
    if (expenseChart) { expenseChart.destroy(); expenseChart = null; }
}

function updateAllCharts() {
    const dashboardActive = document.getElementById('dashboard')?.classList.contains('active');
    const reportsActive = document.getElementById('reports')?.classList.contains('active');
    const expensesActive = document.getElementById('expenses')?.classList.contains('active');
    
    destroyAllCharts();
    
    setTimeout(() => {
        if (dashboardActive) {
            updateFinancialChart();
            updateDonationSourceChart();
            updateProgramPerformanceChart();
            updateVolunteerHoursChart();
        }
        
        if (reportsActive) {
            // These are handled by updateAnalytics()
        }
        
        if (expensesActive) {
            updateExpenseChart();
        }
    }, 100);
}

function updateFinancialChart(months = 6) {
    const canvas = document.getElementById('financialChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    const numMonths = parseInt(months) || 6;
    
    for (let i = numMonths - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));
        
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const income = (ngoData.donations || [])
            .filter(d => d.date && d.date.substring(0, 7) === monthStr)
            .reduce((sum, d) => sum + Number(d.amount || 0), 0);
        
        const expense = (ngoData.expenses || [])
            .filter(e => e.date && e.date.substring(0, 7) === monthStr)
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
        
        incomeData.push(income);
        expenseData.push(expense);
    }
    
    financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(39, 174, 96, 0.7)',
                borderColor: '#27ae60',
                borderWidth: 1
            }, {
                label: 'Expenses',
                data: expenseData,
                backgroundColor: 'rgba(231, 76, 60, 0.7)',
                borderColor: '#e74c3c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateDonationSourceChart() {
    const canvas = document.getElementById('donationSourceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const sources = {};
    (ngoData.donations || []).forEach(d => {
        const type = d.type || 'other';
        sources[type] = (sources[type] || 0) + Number(d.amount || 0);
    });
    
    if (Object.keys(sources).length === 0) {
        sources['No Data'] = 1;
    }
    
    donationSourceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(sources),
            datasets: [{
                data: Object.values(sources),
                backgroundColor: ['#27ae60', '#f39c12', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            cutout: '60%'
        }
    });
}

function updateProgramPerformanceChart() {
    const canvas = document.getElementById('programPerformanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const programs = (ngoData.programs || []).slice(0, 5);
    
    if (programs.length === 0) {
        programPerformanceChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Budget',
                    data: [0],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false
            }
        });
        return;
    }
    
    const budgetData = programs.map(p => Number(p.budget) || 0);
    const spentData = programs.map(p => {
        return (ngoData.expenses || [])
            .filter(e => e.program === p.name)
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    });
    
    programPerformanceChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: programs.map(p => p.name),
            datasets: [{
                label: 'Budget',
                data: budgetData,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#3498db'
            }, {
                label: 'Spent',
                data: spentData,
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    });
}

function updateVolunteerHoursChart() {
    const canvas = document.getElementById('volunteerHoursChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const volunteers = (ngoData.volunteers || []).slice(0, 8);
    
    if (volunteers.length === 0) {
        volunteerHoursChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Volunteers'],
                datasets: [{
                    label: 'Hours Logged',
                    data: [0],
                    backgroundColor: '#f39c12'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false
            }
        });
        return;
    }
    
    volunteerHoursChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: volunteers.map(v => v.name ? v.name.split(' ')[0] : 'Volunteer'),
            datasets: [{
                label: 'Hours Logged',
                data: volunteers.map(v => v.hoursLogged || 0),
                backgroundColor: '#f39c12'
            }, {
                label: 'Tasks Completed',
                data: volunteers.map(v => v.tasksCompleted || 0),
                backgroundColor: '#27ae60'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    });
}

function updateExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const byCategory = {};
    (ngoData.expenses || []).forEach(e => {
        const category = e.category || 'other';
        byCategory[category] = (byCategory[category] || 0) + Number(e.amount || 0);
    });
    
    if (Object.keys(byCategory).length === 0) {
        byCategory['No Expenses'] = 1;
    }
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(byCategory),
            datasets: [{
                data: Object.values(byCategory),
                backgroundColor: ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            cutout: '60%'
        }
    });
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

function addNotification(title, message, type = 'info') {
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        read: false,
        timestamp: new Date().toISOString()
    };
    
    if (!ngoData.notifications) ngoData.notifications = [];
    ngoData.notifications.push(notification);
    
    if (ngoData.notifications.length > 50) {
        ngoData.notifications = ngoData.notifications.slice(-50);
    }
    
    updateNotificationBadge();
    saveData();
    showToast(message, type);
    sendNotification(title, { body: message });
}

function updateNotificationBadge() {
    const unread = (ngoData.notifications || []).filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'inline' : 'none';
    }
}

function displayNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    
    const notifications = [...(ngoData.notifications || [])].reverse().slice(0, 10);
    
    if (notifications.length === 0) {
        list.innerHTML = '<p class="no-data">No notifications</p>';
        return;
    }
    
    list.innerHTML = notifications.map(n => `
        <div class="notification-item ${!n.read ? 'unread' : ''}" onclick="markNotificationRead(${n.id})">
            <div class="notification-icon ${n.type}">
                <i class="fas fa-${n.type === 'success' ? 'check-circle' : 
                                 n.type === 'warning' ? 'exclamation-triangle' : 
                                 n.type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${n.title}</div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-time">${timeAgo(n.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function markNotificationRead(id) {
    const notification = (ngoData.notifications || []).find(n => n.id === id);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
        saveData();
        displayNotifications();
    }
}

function markAllNotificationsRead() {
    (ngoData.notifications || []).forEach(n => n.read = true);
    updateNotificationBadge();
    saveData();
    displayNotifications();
    showToast('All notifications marked as read', 'success');
}

// ============================================
// ACTIVITY FUNCTIONS
// ============================================

function addActivity(type, description) {
    const activity = {
        id: Date.now(),
        type,
        description,
        user: currentUser?.name || 'System',
        timestamp: new Date().toISOString()
    };
    
    if (!ngoData.activities) ngoData.activities = [];
    ngoData.activities.push(activity);
    
    if (ngoData.activities.length > 100) {
        ngoData.activities = ngoData.activities.slice(-100);
    }
    
    saveData();
    updateRecentActivity();
}

function updateRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    if (!activityDiv) return;
    
    const activities = [...(ngoData.activities || [])].reverse().slice(0, 10);
    
    if (activities.length === 0) {
        activityDiv.innerHTML = '<p class="no-data">No recent activity</p>';
        return;
    }
    
    activityDiv.innerHTML = activities.map(a => {
        const icon = getActivityIcon(a.type);
        return `
            <div class="activity-item">
                <div class="activity-icon ${icon.class}">
                    <i class="fas fa-${icon.name}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${a.description}</div>
                    <div class="activity-time">${timeAgo(a.timestamp)} by ${a.user}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityIcon(type) {
    const icons = {
        'beneficiary': { name: 'user-plus', class: 'beneficiary' },
        'donation': { name: 'donate', class: 'donation' },
        'expense': { name: 'chart-line', class: 'expense' },
        'volunteer': { name: 'hands-helping', class: 'volunteer' },
        'program': { name: 'project-diagram', class: 'program' },
        'event': { name: 'calendar-alt', class: 'event' },
        'document': { name: 'file-upload', class: 'document' },
        'message': { name: 'envelope', class: 'message' },
        'task': { name: 'tasks', class: 'task' },
        'login': { name: 'sign-in-alt', class: 'login' },
        'backup': { name: 'database', class: 'backup' },
        'restore': { name: 'cloud-upload-alt', class: 'restore' },
        'clear': { name: 'trash', class: 'danger' }
    };
    return icons[type] || { name: 'info-circle', class: 'info' };
}

// ============================================
// TASK FUNCTIONS
// ============================================

function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assignedTo = document.getElementById('taskAssignedTo').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    
    if (!title || !assignedTo || !dueDate) {
        showToast('Title, assignee and due date are required!', 'warning');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        description: description || '',
        assignedTo: assignedTo,
        dueDate: dueDate,
        priority: priority || 'medium',
        status: 'todo',
        createdBy: currentUser.name,
        created: new Date().toISOString(),
        comments: []
    };
    
    if (!ngoData.tasks) ngoData.tasks = [];
    ngoData.tasks.push(task);
    saveData();
    displayTasks();
    document.getElementById('taskForm').reset();
    showToast('Task created', 'success');
    addActivity('task', `Task created: ${title}`);
    
    updateTaskDropdowns();
}

function displayTasks() {
    const todoTasks = document.getElementById('todoTasks');
    const progressTasks = document.getElementById('progressTasks');
    const doneTasks = document.getElementById('doneTasks');
    
    if (!todoTasks) return;
    
    const tasks = ngoData.tasks || [];
    
    todoTasks.innerHTML = '';
    progressTasks.innerHTML = '';
    doneTasks.innerHTML = '';
    
    document.getElementById('todoCount').textContent = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('progressCount').textContent = tasks.filter(t => t.status === 'in-progress').length;
    document.getElementById('doneCount').textContent = tasks.filter(t => t.status === 'done').length;
    
    tasks.forEach(t => {
        const card = document.createElement('div');
        card.className = `task-card ${t.priority || 'medium'}`;
        card.draggable = true;
        card.ondragstart = (e) => dragStart(e, t.id);
        card.ondragend = () => dragEnd();
        
        card.innerHTML = `
            <div class="task-title">${t.title}</div>
            <div class="task-description">${t.description || ''}</div>
            <div class="task-meta">
                <span><i class="fas fa-user"></i> ${t.assignedTo}</span>
                <span><i class="fas fa-calendar"></i> ${new Date(t.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="task-actions">
                <button onclick="updateTaskStatus(${t.id}, 'todo')" class="small-btn">📋</button>
                <button onclick="updateTaskStatus(${t.id}, 'in-progress')" class="small-btn">⚙️</button>
                <button onclick="updateTaskStatus(${t.id}, 'done')" class="small-btn">✅</button>
                <button onclick="deleteTask(${t.id})" class="small-btn danger">🗑️</button>
            </div>
        `;
        
        if (t.status === 'todo') todoTasks.appendChild(card);
        else if (t.status === 'in-progress') progressTasks.appendChild(card);
        else doneTasks.appendChild(card);
    });
}

let draggedTaskId = null;

function dragStart(e, taskId) {
    draggedTaskId = taskId;
    e.target.style.opacity = '0.5';
}

function dragEnd() {
    document.querySelectorAll('.task-card').forEach(c => c.style.opacity = '1');
}

document.querySelectorAll('.task-column').forEach(column => {
    column.ondragover = (e) => e.preventDefault();
    column.ondrop = (e) => {
        e.preventDefault();
        if (draggedTaskId) {
            const newStatus = column.id.replace('Tasks', '');
            updateTaskStatus(draggedTaskId, newStatus);
            draggedTaskId = null;
        }
    };
});

function updateTaskStatus(taskId, newStatus) {
    const task = (ngoData.tasks || []).find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        saveData();
        displayTasks();
        showToast(`Task moved to ${newStatus}`, 'info');
        
        if (newStatus === 'done') {
            const volunteer = (ngoData.volunteers || []).find(v => v.name === task.assignedTo);
            if (volunteer) {
                volunteer.tasksCompleted = (volunteer.tasksCompleted || 0) + 1;
                volunteer.hoursLogged = (volunteer.hoursLogged || 0) + 2;
                saveData();
            }
        }
    }
}

function deleteTask(id) {
    if (confirm('Delete this task?')) {
        ngoData.tasks = (ngoData.tasks || []).filter(t => t.id !== id);
        saveData();
        displayTasks();
        showToast('Task deleted', 'warning');
    }
}

function updateTaskDropdowns() {
    const taskSelect = document.getElementById('taskAssignedTo');
    if (taskSelect) {
        taskSelect.innerHTML = '<option value="">Assign To</option>';
        (ngoData.volunteers || []).filter(v => v.status === 'active').forEach(v => {
            taskSelect.innerHTML += `<option value="${v.name}">${v.name}</option>`;
        });
    }
}

// ============================================
// PROGRAM FUNCTIONS
// ============================================

function displayPrograms() {
    const container = document.getElementById('programList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchProgram')?.value.toLowerCase() || '';
    const filterStatus = document.getElementById('filterProgramStatus')?.value || 'all';
    
    let filtered = ngoData.programs || [];
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.location && p.location.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filterStatus !== 'all') {
        filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No programs found. Click "Add Program" to create one.</p>';
        updateProgramStats();
        return;
    }
    
    container.innerHTML = filtered.map(p => {
        const programExpenses = (ngoData.expenses || [])
            .filter(e => e.program === p.name)
            .reduce((sum, e) => sum + (e.amount || 0), 0);
        
        const budgetPercent = p.budget > 0 ? ((programExpenses / p.budget) * 100).toFixed(1) : 0;
        const daysLeft = Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
        <div class="program-card ${p.status}">
            <div class="program-header">
                <h3><i class="fas fa-project-diagram"></i> ${p.name}</h3>
                <span class="program-badge badge-${p.status}">${p.status}</span>
            </div>
            
            <div class="program-description">
                ${p.description || 'No description provided.'}
            </div>
            
            <div class="program-details">
                <span><i class="fas fa-calendar-alt"></i> ${new Date(p.startDate).toLocaleDateString()} - ${new Date(p.endDate).toLocaleDateString()}</span>
                <span><i class="fas fa-hourglass-half"></i> ${daysLeft > 0 ? daysLeft + ' days left' : 'Ended'}</span>
                <span><i class="fas fa-rupee-sign"></i> Budget: ₹${(p.budget || 0).toFixed(2)}</span>
                <span><i class="fas fa-chart-line"></i> Spent: ₹${programExpenses.toFixed(2)}</span>
                ${p.location ? `<span><i class="fas fa-map-marker-alt"></i> ${p.location}</span>` : ''}
                ${p.targetBeneficiaries ? `<span><i class="fas fa-users"></i> Target: ${p.targetBeneficiaries}</span>` : ''}
            </div>
            
            <div class="program-progress">
                <div class="progress-stats">
                    <span>Budget Utilization</span>
                    <span>${budgetPercent}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${budgetPercent}%"></div>
                </div>
            </div>
            
            ${p.notes ? `<div class="program-notes"><i class="fas fa-sticky-note"></i> ${p.notes}</div>` : ''}
            
            <div class="program-footer">
                <div class="program-meta">
                    <span><i class="fas fa-clock"></i> Added: ${new Date(p.dateAdded).toLocaleDateString()}</span>
                </div>
                <div class="program-actions">
                    <button class="btn-edit-program" onclick="editProgram(${p.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete-program" onclick="deleteProgram(${p.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
    
    updateProgramStats();
}

function updateProgramStats() {
    const allPrograms    = ngoData.programs || [];
    const activeCount    = allPrograms.filter(p => (p.status||'').toLowerCase()==='active').length;
    const completedCount = allPrograms.filter(p => (p.status||'').toLowerCase()==='completed').length;
    const totalBudget    = allPrograms.reduce((s,p) => s+(Number(p.budget)||0), 0);

    ['activeProgramsCount','activePrograms','programsActiveCount','activeProgramCount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = activeCount;
    });
    const cel = document.getElementById('completedPrograms');
    const bel = document.getElementById('totalProgramBudget');
    if (cel) cel.textContent = completedCount;
    if (bel) bel.textContent = formatCurrency(totalBudget);
}


function showAddProgramModal() {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    
    const nameInput = document.getElementById('modalProgramName');
    const descInput = document.getElementById('modalProgramDescription');
    const budgetInput = document.getElementById('modalProgramBudget');
    const startDateInput = document.getElementById('modalProgramStartDate');
    const endDateInput = document.getElementById('modalProgramEndDate');
    const statusSelect = document.getElementById('modalProgramStatus');
    const targetInput = document.getElementById('modalProgramTarget');
    const locationInput = document.getElementById('modalProgramLocation');
    const notesInput = document.getElementById('modalProgramNotes');
    const activeCheckbox = document.getElementById('modalProgramIsActive');
    
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (budgetInput) budgetInput.value = '';
    if (startDateInput) startDateInput.value = today;
    if (endDateInput) endDateInput.value = nextYearStr;
    if (statusSelect) statusSelect.value = 'planning';
    if (targetInput) targetInput.value = '';
    if (locationInput) locationInput.value = '';
    if (notesInput) notesInput.value = '';
    if (activeCheckbox) activeCheckbox.checked = true;
    
    const modal = document.getElementById('programModal');
    if (modal) modal.classList.add('show');
}

function saveProgramFromModal() {
    const name = document.getElementById('modalProgramName')?.value;
    if (!name) {
        showToast('Program name is required!', 'warning');
        return;
    }
    
    const activeCheckbox = document.getElementById('modalProgramIsActive');
    const statusSelect = document.getElementById('modalProgramStatus');
    const status = activeCheckbox && activeCheckbox.checked ? 'active' : (statusSelect ? statusSelect.value : 'planning');
    
    const program = {
        id: Date.now(),
        name: name,
        description: document.getElementById('modalProgramDescription')?.value || '',
        budget: parseFloat(document.getElementById('modalProgramBudget')?.value) || 0,
        startDate: document.getElementById('modalProgramStartDate')?.value || new Date().toISOString().split('T')[0],
        endDate: document.getElementById('modalProgramEndDate')?.value || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        status: status,
        targetBeneficiaries: parseInt(document.getElementById('modalProgramTarget')?.value) || 0,
        location: document.getElementById('modalProgramLocation')?.value || '',
        notes: document.getElementById('modalProgramNotes')?.value || '',
        dateAdded: new Date().toISOString(),
        actualBeneficiaries: 0,
        totalExpenses: 0
    };
    
    if (!ngoData.programs) ngoData.programs = [];
    ngoData.programs.push(program);
    saveRecord('programs', program); // ✅ Firebase
    displayPrograms();
    
    const modal = document.getElementById('programModal');
    if (modal) modal.classList.remove('show');
    
    showToast('Program added successfully!', 'success');
    addActivity('program', `New program added: ${name}`);
}

function editProgram(id) {
    const program = (ngoData.programs || []).find(p => p.id === id);
    if (!program) return;
    
    const nameInput = document.getElementById('modalProgramName');
    const descInput = document.getElementById('modalProgramDescription');
    const budgetInput = document.getElementById('modalProgramBudget');
    const startDateInput = document.getElementById('modalProgramStartDate');
    const endDateInput = document.getElementById('modalProgramEndDate');
    const statusSelect = document.getElementById('modalProgramStatus');
    const targetInput = document.getElementById('modalProgramTarget');
    const locationInput = document.getElementById('modalProgramLocation');
    const notesInput = document.getElementById('modalProgramNotes');
    const activeCheckbox = document.getElementById('modalProgramIsActive');
    
    if (nameInput) nameInput.value = program.name;
    if (descInput) descInput.value = program.description || '';
    if (budgetInput) budgetInput.value = program.budget || '';
    if (startDateInput) startDateInput.value = program.startDate;
    if (endDateInput) endDateInput.value = program.endDate;
    if (statusSelect) statusSelect.value = program.status;
    if (targetInput) targetInput.value = program.targetBeneficiaries || '';
    if (locationInput) locationInput.value = program.location || '';
    if (notesInput) notesInput.value = program.notes || '';
    if (activeCheckbox) activeCheckbox.checked = program.status === 'active';
    
    ngoData.programs = (ngoData.programs || []).filter(p => p.id !== id);
    
    const modal = document.getElementById('programModal');
    if (modal) modal.classList.add('show');
    showToast('Edit the program and save', 'info');
}

function searchPrograms() {
    displayPrograms();
}

function deleteProgram(id) {
    if (confirm('Are you sure you want to delete this program?')) {
        const program = (ngoData.programs || []).find(p => p.id === id);
        ngoData.programs = (ngoData.programs || []).filter(p => p.id !== id);
        deleteRecord('programs', id); // ✅ Firebase
        displayPrograms();
        showToast('Program deleted', 'warning');
        if (program) addActivity('program', `Program deleted: ${program.name}`);
    }
}

function exportPrograms() {
    if ((ngoData.programs || []).length === 0) {
        showToast('No programs to export', 'warning');
        return;
    }
    
    const data = ngoData.programs.map(p => ({
        Name: p.name,
        Description: p.description || '',
        Budget: p.budget || 0,
        'Start Date': new Date(p.startDate).toLocaleDateString(),
        'End Date': new Date(p.endDate).toLocaleDateString(),
        Status: p.status,
        Location: p.location || '',
        'Target Beneficiaries': p.targetBeneficiaries || 0,
        Notes: p.notes || ''
    }));
    
    exportToCSV(data, 'programs.csv');
    showToast('Programs exported successfully!', 'success');
}

function hideProgramForm() {
    const container = document.getElementById('programFormContainer');
    if (container) container.style.display = 'none';
    const form = document.getElementById('programForm');
    if (form) form.reset();
}

function updateProgramDropdowns() {
    const programSelects = ['beneficiaryProgram', 'donationProgram', 'expenseProgram'];
    const programNames = (ngoData.programs || []).map(p => p.name);
    
    programSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">General</option>';
            programNames.forEach(name => {
                select.innerHTML += `<option value="${name}" ${currentValue === name ? 'selected' : ''}>${name}</option>`;
            });
        }
    });
}

// ============================================
// ENHANCED USER MANAGEMENT FUNCTIONS
// ============================================

// Check if current user can create new users
function checkUserCreationPermission() {
    const userCreationSection = document.getElementById('userCreationSection');
    if (userCreationSection) {
        const canCreateUsers = hasPermission(PERMISSIONS.MANAGE_USERS) || 
                               hasPermission(PERMISSIONS.ALL) ||
                               (currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'hr_manager'));
        userCreationSection.style.display = canCreateUsers ? 'block' : 'none';
    }
}

// Update permissions preview based on selected role
function updatePermissionsPreview() {
    const role = document.getElementById('newRole').value;
    const previewDiv = document.getElementById('permissionsPreview');
    
    const rolePermissions = {
        'finance_manager': ['View Donations', 'Add Donations', 'Edit Donations', 'View Expenses', 'Add Expenses', 'View Reports'],
        'accountant': ['View Donations', 'Add Donations', 'View Expenses', 'Add Expenses'],
        'program_manager': ['View Beneficiaries', 'Add Beneficiaries', 'View Programs', 'Add Programs', 'View Volunteers'],
        'program_coordinator': ['View Beneficiaries', 'Add Beneficiaries', 'View Programs'],
        'field_staff': ['View Beneficiaries', 'Add Beneficiaries'],
        'outreach_worker': ['View Beneficiaries', 'Add Beneficiaries'],
        'volunteer_manager': ['View Volunteers', 'Add Volunteers', 'Edit Volunteers'],
        'donor': ['View Donations', 'View Reports'],
        'volunteer': ['View Volunteers', 'View Calendar'],
        'guest': ['View Reports Only'],
        'super_admin': ['FULL ACCESS - All permissions']
    };
    
    const permissions = rolePermissions[role] || ['Select a role to see permissions'];
    
    previewDiv.innerHTML = permissions.map(p => `<span style="display: inline-block; background: var(--primary-color); color: white; padding: 3px 8px; border-radius: 12px; margin: 2px;">${p}</span>`).join(' ');
}

// Reset user creation form
function resetUserForm() {
    document.getElementById('newFullName').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('newDepartment').value = '';
    document.getElementById('newRole').value = '';
    document.getElementById('permissionsPreview').innerHTML = 'Select a role to see permissions';
}

// Create new user (called from form submission)
function createNewUser(event) {
    event.preventDefault();
    
    // Check permission
    if (!hasPermission(PERMISSIONS.MANAGE_USERS) && !hasPermission(PERMISSIONS.ALL)) {
        showToast('You do not have permission to create users', 'error');
        return;
    }
    
    // Get form values
    const fullName = document.getElementById('newFullName').value;
    const email = document.getElementById('newEmail').value;
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newUserPassword').value;
    const department = document.getElementById('newDepartment').value;
    const role = document.getElementById('newRole').value;
    
    // Validate
    if (!fullName || !email || !username || !password || !department || !role) {
        showToast('All fields are required!', 'warning');
        return;
    }
    
    // Check if username already exists
    if (ngoData.users.some(u => u.username === username)) {
        showToast('Username already exists!', 'error');
        return;
    }
    
    // Check if email already exists
    if (ngoData.users.some(u => u.email === email)) {
        showToast('Email already exists!', 'error');
        return;
    }
    
    // Define permissions based on role
    const rolePermissions = {
        'finance_manager': [
            PERMISSIONS.VIEW_DONATIONS,
            PERMISSIONS.ADD_DONATION,
            PERMISSIONS.EDIT_DONATION,
            PERMISSIONS.VIEW_EXPENSES,
            PERMISSIONS.ADD_EXPENSE,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.EXPORT_REPORTS
        ],
        'accountant': [
            PERMISSIONS.VIEW_DONATIONS,
            PERMISSIONS.ADD_DONATION,
            PERMISSIONS.VIEW_EXPENSES,
            PERMISSIONS.ADD_EXPENSE
        ],
        'program_manager': [
            PERMISSIONS.VIEW_BENEFICIARIES,
            PERMISSIONS.ADD_BENEFICIARY,
            PERMISSIONS.EDIT_BENEFICIARY,
            PERMISSIONS.VIEW_PROGRAMS,
            PERMISSIONS.ADD_PROGRAM,
            PERMISSIONS.EDIT_PROGRAM,
            PERMISSIONS.VIEW_VOLUNTEERS
        ],
        'program_coordinator': [
            PERMISSIONS.VIEW_BENEFICIARIES,
            PERMISSIONS.ADD_BENEFICIARY,
            PERMISSIONS.EDIT_BENEFICIARY,
            PERMISSIONS.VIEW_PROGRAMS
        ],
        'field_staff': [
            PERMISSIONS.VIEW_BENEFICIARIES,
            PERMISSIONS.ADD_BENEFICIARY,
            PERMISSIONS.EDIT_BENEFICIARY
        ],
        'outreach_worker': [
            PERMISSIONS.VIEW_BENEFICIARIES,
            PERMISSIONS.ADD_BENEFICIARY
        ],
        'volunteer_manager': [
            PERMISSIONS.VIEW_VOLUNTEERS,
            PERMISSIONS.ADD_VOLUNTEER,
            PERMISSIONS.EDIT_VOLUNTEER,
            PERMISSIONS.VIEW_REPORTS
        ],
        'donor': [
            PERMISSIONS.VIEW_DONATIONS,
            PERMISSIONS.VIEW_REPORTS
        ],
        'volunteer': [
            PERMISSIONS.VIEW_VOLUNTEERS
        ],
        'guest': [
            PERMISSIONS.VIEW_REPORTS
        ]
    };
    
    // Create new user object
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        role: role,
        name: fullName,
        email: email,
        department: department,
        permissions: rolePermissions[role] || [],
        createdAt: new Date().toISOString(),
        createdBy: currentUser ? currentUser.name : 'System'
    };
    
    // Add to users array
    ngoData.users.push(newUser);
    
    // Save data
    saveData();
    
    // Refresh user list
    displayUsers();
    
    // Reset form
    resetUserForm();
    
    // Show success message
    showToast(`User ${fullName} created successfully!`, 'success');
    
    // Log activity
    addActivity('user', `New user created: ${fullName} (${role})`);
}

// Enhanced displayUsers function (replaces the old one)
function displayUsers() {
    const list = document.getElementById('userList');
    if (!list) return;
    
    // Clear and add header
    list.innerHTML = '';
    
    // Sort users by role and name
    const sortedUsers = [...ngoData.users].sort((a, b) => {
        if (a.role === 'super_admin') return -1;
        if (b.role === 'super_admin') return 1;
        return (a.name || '').localeCompare(b.name || '');
    });
    
    sortedUsers.forEach(u => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        // Don't allow deleting super_admin or yourself
        const canDelete = (u.id !== 1 && u.id !== currentUser?.id) && 
                         (hasPermission(PERMISSIONS.MANAGE_USERS) || hasPermission(PERMISSIONS.ALL));
        
        // Get role display name
        const roleDisplay = {
            'super_admin': '👑 Super Admin',
            'finance_manager': '💰 Finance Manager',
            'accountant': '📊 Accountant',
            'program_manager': '📋 Program Director',
            'program_coordinator': '📌 Program Coordinator',
            'field_staff': '🌍 Field Officer',
            'outreach_worker': '🤝 Outreach Worker',
            'volunteer_manager': '👥 Volunteer Coordinator',
            'hr_manager': '👔 HR Manager',
            'executive_director': '🎯 Executive Director',
            'board_member': '📋 Board Member',
            'donor': '❤️ Donor',
            'volunteer': '🙋 Volunteer',
            'guest': '👁️ Guest',
            'auditor': '🔍 Auditor'
        };
        
        item.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <strong>${u.name}</strong>
                    <span style="background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                        ${roleDisplay[u.role] || u.role}
                    </span>
                    <span style="background: var(--light-color); padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                        ${u.department || 'N/A'}
                    </span>
                </div>
                <small style="display: block; margin-top: 5px;">
                    <i class="fas fa-envelope"></i> ${u.email} | 
                    <i class="fas fa-user"></i> ${u.username}
                    ${u.createdAt ? ` | <i class="fas fa-calendar"></i> Joined: ${new Date(u.createdAt).toLocaleDateString()}` : ''}
                </small>
            </div>
            ${canDelete ? `
                <button class="delete-btn" onclick="deleteUser(${u.id})" title="Delete User">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        `;
        list.appendChild(item);
    });
}

// Enhanced deleteUser function (replaces the old one)
function deleteUser(id) {
    // Check permission
    if (!hasPermission(PERMISSIONS.MANAGE_USERS) && !hasPermission(PERMISSIONS.ALL)) {
        showToast('You do not have permission to delete users', 'error');
        return;
    }
    
    // Don't allow deleting super admin (id 1)
    if (id === 1) {
        showToast('Cannot delete the main administrator', 'error');
        return;
    }
    
    // Don't allow deleting yourself
    if (id === currentUser?.id) {
        showToast('You cannot delete your own account', 'error');
        return;
    }
    
    const userToDelete = ngoData.users.find(u => u.id === id);
    
    if (confirm(`Are you sure you want to delete user ${userToDelete?.name}?`)) {
        ngoData.users = ngoData.users.filter(u => u.id !== id);
        saveData();
        displayUsers();
        showToast('User deleted successfully', 'warning');
        addActivity('user', `User deleted: ${userToDelete?.name}`);
    }
}

// Keep changePassword as is
function changePassword() {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        const user = (ngoData.users || []).find(u => u.id === currentUser?.id);
        if (user) {
            user.password = newPassword;
            saveData();
            showToast('Password changed successfully', 'success');
        }
    }
}

// Keep addUser as is (for the old form)
function addUser() {
    const username = document.getElementById('newUsername')?.value;
    const password = document.getElementById('newPassword')?.value;
    const role = document.getElementById('userRole')?.value;
    
    if (!username || !password) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        role: role,
        name: username
    };
    
    if (!ngoData.users) ngoData.users = [];
    ngoData.users.push(newUser);
    saveData();
    displayUsers();
    const form = document.getElementById('userForm');
    if (form) form.reset();
    showToast('User added successfully', 'success');
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

function updateDashboard() {
    const allBeneficiaries = ngoData.beneficiaries || [];
    const allDonations     = ngoData.donations     || [];
    const allExpenses      = ngoData.expenses      || [];
    const allPrograms      = ngoData.programs      || [];
    const allVolunteers    = ngoData.volunteers     || [];

    const totalBeneficiaries = allBeneficiaries.length;
    const totalDonations     = allDonations.reduce((s,d) => s + Number(d.amount||0), 0);
    const totalExpenses      = allExpenses.reduce((s,e)  => s + Number(e.amount||0), 0);
    const balance            = totalDonations - totalExpenses;

    // Use most recent month that has data (not just current calendar month)
    const currentDate  = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear  = currentDate.getFullYear();

    // Find latest month/year that has donations
    let checkMonth = currentMonth, checkYear = currentYear;
    let thisMonthDonations = 0, lastMonthDonations = 0;
    for (let i = 0; i < 12; i++) {
        let m = currentMonth - i, y = currentYear;
        if (m < 0) { m += 12; y--; }
        const amt = allDonations.filter(d => {
            const dt = new Date(d.date);
            return dt.getMonth() === m && dt.getFullYear() === y;
        }).reduce((s,d) => s + Number(d.amount||0), 0);
        if (amt > 0) { checkMonth = m; checkYear = y; thisMonthDonations = amt; break; }
    }
    // Previous month before the found one
    let prevMonth = checkMonth - 1, prevYear = checkYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear--; }
    lastMonthDonations = allDonations.filter(d => {
        const dt = new Date(d.date);
        return dt.getMonth() === prevMonth && dt.getFullYear() === prevYear;
    }).reduce((s,d) => s + Number(d.amount||0), 0);

    // This month expenses (same logic)
    let thisMonthExpenses = allExpenses.filter(e => {
        const dt = new Date(e.date);
        return dt.getMonth() === checkMonth && dt.getFullYear() === checkYear;
    }).reduce((s,e) => s + Number(e.amount||0), 0);

    const donationTrend = lastMonthDonations > 0
        ? ((thisMonthDonations - lastMonthDonations) / lastMonthDonations * 100).toFixed(1)
        : (thisMonthDonations > 0 ? 100 : 0);

    // Active programs
    const activePrograms = allPrograms.filter(p => (p.status||'').toLowerCase() === 'active').length;

    // Volunteer hours
    const volHours = allVolunteers.reduce((s,v) => s + (Number(v.hoursLogged)||0), 0);

    // Update all dashboard elements
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('totalBeneficiaries', totalBeneficiaries);
    set('totalDonations',     formatCurrency(totalDonations));
    set('totalExpenses',      formatCurrency(totalExpenses));
    set('balance',            formatCurrency(balance));
    set('monthlyDonations',   formatCurrency(thisMonthDonations));
    set('monthlyExpenses',    formatCurrency(thisMonthExpenses));
    set('pgMonthlyDonations', formatCurrency(thisMonthDonations));
    set('pgMonthlyExpenses',  formatCurrency(thisMonthExpenses));
    set('volunteerHours',     volHours);
    set('pgVolunteerHours',   volHours);

    // Active programs counter - update all possible IDs
    ['activePrograms','activeProgramsCount','programsActiveCount'].forEach(id => set(id, activePrograms));

    const trendElem = document.getElementById('donationTrend');
    if (trendElem) {
        trendElem.textContent = (donationTrend > 0 ? '+' : '') + donationTrend + '%';
        trendElem.className = 'kpi-trend ' + (donationTrend >= 0 ? 'positive' : 'negative');
    }
    if (typeof displayUpcomingEvents === 'function') displayUpcomingEvents();
}


// ============================================
// REPORT FUNCTIONS
// ============================================

function generateReport() {
    const reportType = document.getElementById('reportType')?.value || 'financial';
    const reportMonth = document.getElementById('reportMonth')?.value || '';
    
    let reportHTML = '';
    
    switch(reportType) {
        case 'financial':
            reportHTML = generateFinancialReport(reportMonth);
            break;
        case 'beneficiary':
            reportHTML = generateBeneficiaryReport();
            break;
        case 'donation':
            reportHTML = generateDonationReport(reportMonth);
            break;
        case 'program':
            reportHTML = generateProgramReport();
            break;
    }
    
    const reportOutput = document.getElementById('reportOutput');
    if (reportOutput) {
        reportOutput.innerHTML = reportHTML;
    }
}

function generateFinancialReport(month) {
    let filteredDonations = ngoData.donations || [];
    let filteredExpenses = ngoData.expenses || [];
    
    if (month) {
        filteredDonations = filteredDonations.filter(d => d.date?.substring(0, 7) === month);
        filteredExpenses = filteredExpenses.filter(e => e.date?.substring(0, 7) === month);
    }
    
    const totalDonations = filteredDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const balance = totalDonations - totalExpenses;
    
    const expensesByCategory = filteredExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
        return acc;
    }, {});
    
    return `
        <h3>Financial Report ${month ? `- ${month}` : ''}</h3>
        <table class="report-table">
            <tr>
                <th>Category</th>
                <th>Amount</th>
            </tr>
            <tr>
                <td>Total Donations</td>
                <td>${formatCurrency(totalDonations)}</td>
            </tr>
            <tr>
                <td>Total Expenses</td>
                <td>${formatCurrency(totalExpenses)}</td>
            </tr>
            <tr style="font-weight: bold; background: #f0f0f0;">
                <td>Net Balance</td>
                <td>${formatCurrency(balance)}</td>
            </tr>
        </table>
        
        <h4>Expenses by Category</h4>
        <table class="report-table">
            <tr>
                <th>Category</th>
                <th>Amount</th>
            </tr>
            ${Object.entries(expensesByCategory).map(([cat, amt]) => `
                <tr>
                    <td>${cat}</td>
                    <td>${formatCurrency(amt)}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

function generateBeneficiaryReport() {
    const beneficiaries = ngoData.beneficiaries || [];
    
    const byType = beneficiaries.reduce((acc, b) => {
        acc[b.type] = (acc[b.type] || 0) + 1;
        return acc;
    }, {});
    
    const byProgram = beneficiaries.reduce((acc, b) => {
        const program = b.program || 'General';
        acc[program] = (acc[program] || 0) + 1;
        return acc;
    }, {});
    
    return `
        <h3>Beneficiary Report</h3>
        <p>Total Beneficiaries: ${beneficiaries.length}</p>
        
        <h4>By Type</h4>
        <table class="report-table">
            <tr>
                <th>Type</th>
                <th>Count</th>
            </tr>
            ${Object.entries(byType).map(([type, count]) => `
                <tr>
                    <td>${type}</td>
                    <td>${count}</td>
                </tr>
            `).join('')}
        </table>
        
        <h4>By Program</h4>
        <table class="report-table">
            <tr>
                <th>Program</th>
                <th>Count</th>
            </tr>
            ${Object.entries(byProgram).map(([program, count]) => `
                <tr>
                    <td>${program}</td>
                    <td>${count}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

function generateDonationReport(month) {
    let filtered = ngoData.donations || [];
    if (month) {
        filtered = filtered.filter(d => d.date?.substring(0, 7) === month);
    }
    
    const byType = filtered.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + Number(d.amount || 0);
        return acc;
    }, {});
    
    const byProgram = filtered.reduce((acc, d) => {
        const program = d.program || 'General';
        acc[program] = (acc[program] || 0) + Number(d.amount || 0);
        return acc;
    }, {});
    
    return `
        <h3>Donation Report ${month ? `- ${month}` : ''}</h3>
        <p>Total Donations: ${formatCurrency(filtered.reduce((sum, d) => sum + Number(d.amount || 0), 0))}</p>
        <p>Number of Donations: ${filtered.length}</p>
        
        <h4>By Type</h4>
        <table class="report-table">
            <tr>
                <th>Type</th>
                <th>Amount</th>
            </tr>
            ${Object.entries(byType).map(([type, amt]) => `
                <tr>
                    <td>${type}</td>
                    <td>${formatCurrency(amt)}</td>
                </tr>
            `).join('')}
        </table>
        
        <h4>By Program</h4>
        <table class="report-table">
            <tr>
                <th>Program</th>
                <th>Amount</th>
            </tr>
            ${Object.entries(byProgram).map(([program, amt]) => `
                <tr>
                    <td>${program}</td>
                    <td>${formatCurrency(amt)}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

function generateProgramReport() {
    let html = '<h3>Program Performance Report</h3>';
    
    (ngoData.programs || []).forEach(p => {
        const programDonations = (ngoData.donations || [])
            .filter(d => d.program === p.name)
            .reduce((sum, d) => sum + Number(d.amount || 0), 0);
        
        const programExpenses = (ngoData.expenses || [])
            .filter(e => e.program === p.name)
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
        
        const programBeneficiaries = (ngoData.beneficiaries || [])
            .filter(b => b.program === p.name).length;
        
        html += `
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                <h4>${p.name} (${p.status})</h4>
                <p>Budget: ${formatCurrency(Number(p.budget || 0))}</p>
                <p>Donations Received: ${formatCurrency(programDonations)}</p>
                <p>Expenses: ${formatCurrency(programExpenses)}</p>
                <p>Net: ${formatCurrency(programDonations - programExpenses)}</p>
                <p>Beneficiaries Served: ${programBeneficiaries}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${p.budget > 0 ? (programExpenses / p.budget * 100).toFixed(1) : 0}%"></div>
                </div>
                <small>Budget Utilization: ${p.budget > 0 ? (programExpenses / p.budget * 100).toFixed(1) : 0}%</small>
            </div>
        `;
    });
    
    if ((ngoData.programs || []).length === 0) {
        html += '<p>No programs created yet.</p>';
    }
    
    return html;
}

function generateMonthlyReport() {
    showSection('reports');
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const startDate = document.getElementById('reportStartDate');
    const endDate = document.getElementById('reportEndDate');
    if (startDate) startDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    if (endDate) endDate.value = today.toISOString().split('T')[0];
    updateAnalytics();
    showToast('Monthly report generated', 'success');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(amount) {
    const currency = ngoData.settings.currency;
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return `${symbols[currency] || '₹'}${Number(amount || 0).toFixed(2)}`;
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    
    const donationDate = document.getElementById('donationDate');
    const expenseDate = document.getElementById('expenseDate');
    const volunteerDate = document.getElementById('volunteerJoinDate');
    const taskDate = document.getElementById('taskDueDate');
    const eventDate = document.getElementById('eventDate');
    const reportMonth = document.getElementById('reportMonth');
    
    if (donationDate) donationDate.value = today;
    if (expenseDate) expenseDate.value = today;
    if (volunteerDate) volunteerDate.value = today;
    if (taskDate) taskDate.value = today;
    if (eventDate) eventDate.value = today;
    if (reportMonth) reportMonth.value = today.substring(0, 7);
}

function loadDailyQuote() {
    const quotes = [
        "Making a difference, one life at a time.",
        "Together we can change the world.",
        "Small acts of kindness can make a big impact.",
        "Every donation counts, every volunteer matters.",
        "Building a better tomorrow, today.",
        "Compassion in action.",
        "Serving humanity with pride.",
        "Your contribution brings hope."
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteElem = document.getElementById('dailyQuote');
    if (quoteElem) {
        quoteElem.textContent = `"${randomQuote}"`;
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    if ('vibrate' in navigator) {
        if (type === 'error' || type === 'warning') {
            navigator.vibrate([200, 100, 200]);
        } else if (type === 'success') {
            navigator.vibrate(100);
        }
    }
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

// ============================================
// QUICK ACTION FUNCTIONS
// ============================================

function quickAddBeneficiary() {
    showSection('beneficiaries');
    showAddBeneficiaryModal();
    const menu = document.getElementById('quickActionsMenu');
    if (menu) menu.style.display = 'none';
}

function quickAddDonation() {
    showSection('donations');
    showAddDonationModal();
    const menu = document.getElementById('quickActionsMenu');
    if (menu) menu.style.display = 'none';
}

function quickAddExpense() {
    showSection('expenses');
    showAddExpenseModal();
    const menu = document.getElementById('quickActionsMenu');
    if (menu) menu.style.display = 'none';
}

function quickAddVolunteer() {
    showSection('volunteers');
    showAddVolunteerModal();
    const menu = document.getElementById('quickActionsMenu');
    if (menu) menu.style.display = 'none';
}

function quickAddEvent() {
    showAddEventModal();
    const menu = document.getElementById('quickActionsMenu');
    if (menu) menu.style.display = 'none';
}

function quickAddDocument() {
    showUploadModal();
    const menu = document.getElementById('quickActionsMenu');
    if (menu) menu.style.display = 'none';
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportToCSV(data, filename) {
    if (data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    showToast(`Exported to ${filename}`, 'success');
}

function exportAnalytics() {
    const data = {
        beneficiaries: (ngoData.beneficiaries || []).length,
        donations: (ngoData.donations || []).reduce((sum, d) => sum + Number(d.amount || 0), 0),
        expenses: (ngoData.expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0),
        volunteers: (ngoData.volunteers || []).length,
        programs: (ngoData.programs || []).length,
        generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Analytics exported', 'success');
}

function exportBeneficiaries() {
    if ((ngoData.beneficiaries || []).length === 0) {
        showToast('No beneficiaries to export', 'warning');
        return;
    }
    
    const data = ngoData.beneficiaries.map(b => ({
        'ID': b.id,
        'Name': b.name,
        'Type': b.type || 'Individual',
        'Contact': b.contact || 'N/A',
        'Email': b.email || 'N/A',
        'Address': b.address || 'N/A',
        'Program': b.program || 'General',
        'Date Added': new Date(b.dateAdded).toLocaleDateString(),
        'Notes': b.notes || ''
    }));
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `beneficiaries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`${data.length} beneficiaries exported successfully!`, 'success');
}

function exportDonations() {
    const data = (ngoData.donations || []).map(d => ({
        'Donor Name': d.donorName,
        Amount: d.amount,
        Type: d.type,
        Date: new Date(d.date).toLocaleDateString(),
        Program: d.program || 'General',
        Notes: d.notes || ''
    }));
    
    exportToCSV(data, 'donations.csv');
}

function exportExpenses() {
    const data = (ngoData.expenses || []).map(e => ({
        Description: e.description,
        Amount: e.amount,
        Category: e.category,
        Date: new Date(e.date).toLocaleDateString(),
        Program: e.program || 'General',
        Notes: e.notes || ''
    }));
    
    exportToCSV(data, 'expenses.csv');
}

function exportAllData() {
    const wb = XLSX.utils.book_new();
    
    const benData = (ngoData.beneficiaries || []).map(b => ({
        Name: b.name,
        Type: b.type,
        Contact: b.contact,
        Email: b.email,
        Address: b.address,
        Program: b.program || 'General',
        'Date Added': new Date(b.dateAdded).toLocaleDateString()
    }));
    const benSheet = XLSX.utils.json_to_sheet(benData);
    XLSX.utils.book_append_sheet(wb, benSheet, 'Beneficiaries');
    
    const donData = (ngoData.donations || []).map(d => ({
        'Donor Name': d.donorName,
        Amount: d.amount,
        Type: d.type,
        Date: new Date(d.date).toLocaleDateString(),
        Program: d.program || 'General',
        Notes: d.notes || ''
    }));
    const donSheet = XLSX.utils.json_to_sheet(donData);
    XLSX.utils.book_append_sheet(wb, donSheet, 'Donations');
    
    const expData = (ngoData.expenses || []).map(e => ({
        Description: e.description,
        Amount: e.amount,
        Category: e.category,
        Date: new Date(e.date).toLocaleDateString(),
        Program: e.program || 'General',
        Notes: e.notes || ''
    }));
    const expSheet = XLSX.utils.json_to_sheet(expData);
    XLSX.utils.book_append_sheet(wb, expSheet, 'Expenses');
    
    const progData = (ngoData.programs || []).map(p => ({
        Name: p.name,
        Description: p.description,
        Budget: p.budget,
        'Start Date': new Date(p.startDate).toLocaleDateString(),
        'End Date': new Date(p.endDate).toLocaleDateString(),
        Status: p.status
    }));
    const progSheet = XLSX.utils.json_to_sheet(progData);
    XLSX.utils.book_append_sheet(wb, progSheet, 'Programs');
    
    XLSX.writeFile(wb, 'ngo_complete_data.xlsx');
}

function exportReport() {
    const reportType = document.getElementById('reportType')?.value || 'financial';
    const reportMonth = document.getElementById('reportMonth')?.value || '';
    const reportHTML = document.getElementById('reportOutput')?.innerHTML;
    
    if (!reportHTML) return;
    
    const blob = new Blob([reportHTML.replace(/<[^>]*>/g, '\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${reportMonth || 'all'}.txt`;
    link.click();
}

// ============================================
// UPDATE ALL FUNCTION
// ============================================

function updateAll() {
    updateDashboard();
    displayBeneficiaries();
    displayDonations();
    updateDonationStats();
    displayExpenses();
    displayPrograms();
    displayVolunteers();
    displayMessages();
    displayAnnouncements();
    displayNewsletters();
    updateCommsFormVisibility();
    displayTasks();
    displayDocuments();
    displayUsers();
    updateProgramDropdowns();
    updateRecentActivity();
    updateNotificationBadge();
    displayUpcomingEvents();
    
    if (document.getElementById('reports')?.classList.contains('active') ||
        document.getElementById('expenses')?.classList.contains('active')) {
        updateAllCharts();
    }
    setTimeout(function(){ updateProgramStats(); }, 200);
}

// ============================================
// EXPENSE FUNCTIONS
// ============================================

function showAddExpenseModal() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('modalExpenseDate');
    if (dateInput) dateInput.value = today;
    
    const programSelect = document.getElementById('modalExpenseProgram');
    if (programSelect) {
        programSelect.innerHTML = '<option value="">General</option>';
        (ngoData.programs || []).forEach(p => {
            programSelect.innerHTML += `<option value="${p.name}">${p.name}</option>`;
        });
    }
    
    const descInput = document.getElementById('modalExpenseDescription');
    const amountInput = document.getElementById('modalExpenseAmount');
    const categorySelect = document.getElementById('modalExpenseCategory');
    const programInput = document.getElementById('modalExpenseProgram');
    const paymentSelect = document.getElementById('modalExpensePaymentMethod');
    const vendorInput = document.getElementById('modalExpenseVendor');
    const referenceInput = document.getElementById('modalExpenseReference');
    const notesInput = document.getElementById('modalExpenseNotes');
    const reimbursableCheck = document.getElementById('modalExpenseReimbursable');
    
    if (descInput) descInput.value = '';
    if (amountInput) amountInput.value = '';
    if (categorySelect) categorySelect.value = 'program';
    if (programInput) programInput.value = '';
    if (paymentSelect) paymentSelect.value = 'cash';
    if (vendorInput) vendorInput.value = '';
    if (referenceInput) referenceInput.value = '';
    if (notesInput) notesInput.value = '';
    if (reimbursableCheck) reimbursableCheck.checked = false;
    
    const modal = document.getElementById('expenseModal');
    if (modal) modal.classList.add('show');
}

function saveExpenseFromModal() {
    const description = document.getElementById('modalExpenseDescription')?.value;
    const amount = document.getElementById('modalExpenseAmount')?.value;
    
    if (!description || !amount) {
        showToast('Description and amount are required!', 'warning');
        return;
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
        showToast('Please enter a valid amount!', 'warning');
        return;
    }
    
    const expense = {
        id: Date.now(),
        description: description,
        amount: parseFloat(amount),
        date: document.getElementById('modalExpenseDate')?.value || new Date().toISOString().split('T')[0],
        category: document.getElementById('modalExpenseCategory')?.value || 'program',
        program: document.getElementById('modalExpenseProgram')?.value || '',
        paymentMethod: document.getElementById('modalExpensePaymentMethod')?.value || 'cash',
        vendor: document.getElementById('modalExpenseVendor')?.value || '',
        reference: document.getElementById('modalExpenseReference')?.value || '',
        notes: document.getElementById('modalExpenseNotes')?.value || '',
        reimbursable: document.getElementById('modalExpenseReimbursable')?.checked || false
    };
    
    if (!ngoData.expenses) ngoData.expenses = [];
    ngoData.expenses.push(expense);
    saveRecord('expenses', expense); // ✅ Firebase
    displayExpenses();
    
    const modal = document.getElementById('expenseModal');
    if (modal) modal.classList.remove('show');
    
    showToast('Expense added successfully!', 'success');
    addActivity('expense', `Expense added: ${description} - $${amount}`);
}

function displayExpenses() {

    const EXPENSE_CATEGORIES = {
        'program':   'Program Expenses',
        'admin':     'Administrative',
        'staff':     'Staff Salary',
        'equipment': 'Equipment',
        'travel':    'Travel',
        'utilities': 'Utilities',
        'rent':      'Rent',
        'other':     'Other',
        'infrastructure': 'Infrastructure'
    };
    const getCategoryLabel = (cat) => EXPENSE_CATEGORIES[cat] || cat || 'Other';
    const container = document.getElementById('expenseList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchExpense')?.value.toLowerCase() || '';
    const filterCategory = document.getElementById('filterExpenseCategory')?.value || 'all';
    
    let filtered = ngoData.expenses || [];
    
    if (searchTerm) {
        filtered = filtered.filter(e => 
            (e.description && e.description.toLowerCase().includes(searchTerm)) ||
            (e.vendor && e.vendor.toLowerCase().includes(searchTerm)) ||
            (e.notes && e.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filterCategory !== 'all') {
        filtered = filtered.filter(e => e.category === filterCategory);
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No expenses found. Click "Add Expense" to add one.</p>';
        updateExpenseStats();
        return;
    }
    
    container.innerHTML = filtered.map(e => `
        <div class="expense-card">
            <div class="expense-header">
                <h4><i class="fas fa-receipt"></i> ${e.description}</h4>
                <span class="expense-amount">₹${e.amount.toFixed(2)}</span>
            </div>
            <div class="expense-details">
                <span><i class="fas fa-calendar"></i> ${new Date(e.date).toLocaleDateString()}</span>
                <span><i class="fas fa-folder"></i> ${getCategoryLabel(e.category)}</span>
                <span><i class="fas fa-project-diagram"></i> ${e.program || 'General'}</span>
                <span><i class="fas fa-credit-card"></i> ${e.paymentMethod || 'N/A'}</span>
                ${e.vendor ? `<span><i class="fas fa-building"></i> ${e.vendor}</span>` : ''}
                ${e.reference ? `<span><i class="fas fa-hashtag"></i> ${e.reference}</span>` : ''}
                ${e.reimbursable ? `<span><i class="fas fa-undo-alt"></i> Reimbursable</span>` : ''}
            </div>
            ${e.notes ? `<div class="expense-notes"><i class="fas fa-sticky-note"></i> ${e.notes}</div>` : ''}
            <div class="expense-actions">
                <button class="btn-edit-expense" onclick="editExpense(${e.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete-expense" onclick="deleteExpense(${e.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    updateExpenseStats();
}

function updateExpenseStats() {
    const expenses = ngoData.expenses || [];
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalElem = document.getElementById('totalExpensesAmount');
    if (totalElem) totalElem.textContent = formatCurrency(total);
    
    const now = new Date();
    const thisMonth = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + (e.amount || 0), 0);
    const monthElem = document.getElementById('monthlyExpenses');
    if (monthElem) monthElem.textContent = formatCurrency(thisMonth);
    
    const categories = new Set(expenses.map(e => e.category)).size;
    const catElem = document.getElementById('expenseCategories');
    if (catElem) catElem.textContent = categories;
}

function editExpense(id) {
    const expense = (ngoData.expenses || []).find(e => e.id === id);
    if (!expense) return;
    
    const descInput = document.getElementById('modalExpenseDescription');
    const amountInput = document.getElementById('modalExpenseAmount');
    const dateInput = document.getElementById('modalExpenseDate');
    const categorySelect = document.getElementById('modalExpenseCategory');
    const programInput = document.getElementById('modalExpenseProgram');
    const paymentSelect = document.getElementById('modalExpensePaymentMethod');
    const vendorInput = document.getElementById('modalExpenseVendor');
    const referenceInput = document.getElementById('modalExpenseReference');
    const notesInput = document.getElementById('modalExpenseNotes');
    const reimbursableCheck = document.getElementById('modalExpenseReimbursable');
    
    if (descInput) descInput.value = expense.description;
    if (amountInput) amountInput.value = expense.amount;
    if (dateInput) dateInput.value = expense.date;
    if (categorySelect) categorySelect.value = expense.category;
    if (programInput) programInput.value = expense.program || '';
    if (paymentSelect) paymentSelect.value = expense.paymentMethod || 'cash';
    if (vendorInput) vendorInput.value = expense.vendor || '';
    if (referenceInput) referenceInput.value = expense.reference || '';
    if (notesInput) notesInput.value = expense.notes || '';
    if (reimbursableCheck) reimbursableCheck.checked = expense.reimbursable || false;
    
    ngoData.expenses = (ngoData.expenses || []).filter(e => e.id !== id);
    
    const modal = document.getElementById('expenseModal');
    if (modal) modal.classList.add('show');
    showToast('Edit the expense and save', 'info');
}

function searchExpenses() {
    displayExpenses();
}

function deleteExpense(id, silent = false) {
    if (!silent && !confirm('Delete this expense?')) return;
    
    const expense = (ngoData.expenses || []).find(e => e.id === id);
    ngoData.expenses = (ngoData.expenses || []).filter(e => e.id !== id);
    deleteRecord('expenses', id); // ✅ Firebase
    displayExpenses();
    if (!silent && expense) {
        showToast('Expense deleted', 'warning');
        addActivity('expense', `Expense deleted: ${expense.description}`);
    }
}

// ============================================
// ROLE-BASED ACCESS CONTROL FUNCTIONS
// ============================================

// Check if current user has permission
function hasPermission(permission) {
    if (!currentUser) return false;
    
    // Super admin has all permissions
    if (currentUser.permissions && currentUser.permissions.includes(PERMISSIONS.ALL)) {
        return true;
    }
    
    return currentUser.permissions && currentUser.permissions.includes(permission);
}

// Check if user has any of the given permissions
function hasAnyPermission(permissions) {
    if (!currentUser) return false;
    if (currentUser.permissions && currentUser.permissions.includes(PERMISSIONS.ALL)) {
        return true;
    }
    return permissions.some(p => currentUser.permissions && currentUser.permissions.includes(p));
}

// Check if user has all of the given permissions
function hasAllPermissions(permissions) {
    if (!currentUser) return false;
    if (currentUser.permissions && currentUser.permissions.includes(PERMISSIONS.ALL)) {
        return true;
    }
    return permissions.every(p => currentUser.permissions && currentUser.permissions.includes(p));
}

// Get role-based dashboard
function getRoleDashboard(role) {
    const dashboards = {
        'super_admin': 'dashboard',
        'finance_manager': 'donations',
        'accountant': 'expenses',
        'program_manager': 'programs',
        'program_coordinator': 'beneficiaries',
        'field_staff': 'beneficiaries',
        'outreach_worker': 'beneficiaries',
        'volunteer_manager': 'volunteers',
        'hr_manager': 'volunteers',
        'executive_director': 'reports',
        'board_member': 'reports',
        'guest': 'reports',
        'auditor': 'reports'
    };
    return dashboards[role] || 'dashboard';
}

// Update UI based on user role
function updateUIForRole(role) {
    const roleDisplay = {
        'super_admin': 'SUPER ADMIN',
        'finance_manager': 'FINANCE MANAGER',
        'accountant': 'ACCOUNTANT',
        'program_manager': 'PROGRAM DIRECTOR',
        'program_coordinator': 'PROGRAM COORDINATOR',
        'field_staff': 'FIELD OFFICER',
        'outreach_worker': 'OUTREACH WORKER',
        'volunteer_manager': 'VOLUNTEER COORDINATOR',
        'hr_manager': 'HR MANAGER',
        'executive_director': 'EXECUTIVE DIRECTOR',
        'board_member': 'BOARD MEMBER',
        'donor': 'DONOR',
        'volunteer': 'VOLUNTEER',
        'guest': 'GUEST',
        'auditor': 'AUDITOR'
    };
    
    document.getElementById('userRole').textContent = roleDisplay[role] || role.toUpperCase();
    
    // Check user creation permission
    checkUserCreationPermission();
    
    // Hide menu items based on permissions
    document.querySelectorAll('.menu-item').forEach(item => {
        const section = item.textContent.toLowerCase();
        let show = false;
        
        var isGuest = currentUser && currentUser.role === 'guest';
        if (isGuest) {
            // Guest sees ONLY Analytics
            show = section.includes('analytics');
        } else if (section.includes('dashboard')) show = true;
        else if (section.includes('beneficiaries')) show = hasPermission(PERMISSIONS.VIEW_BENEFICIARIES);
        else if (section.includes('donations')) show = hasPermission(PERMISSIONS.VIEW_DONATIONS);
        else if (section.includes('expenses')) show = hasPermission(PERMISSIONS.VIEW_EXPENSES);
        else if (section.includes('programs')) show = hasPermission(PERMISSIONS.VIEW_PROGRAMS);
        else if (section.includes('volunteers')) show = hasPermission(PERMISSIONS.VIEW_VOLUNTEERS);
        else if (section.includes('calendar')) show = true; // Calendar is viewable by all
        else if (section.includes('documents')) show = true;
        else if (section.includes('communications')) show = true;
        else if (section.includes('analytics')) show = hasPermission(PERMISSIONS.VIEW_REPORTS);
        else if (section.includes('settings')) show = hasPermission(PERMISSIONS.MANAGE_SETTINGS);
        
        item.style.display = show ? 'flex' : 'none';
    });
}

// Call this when settings section is shown
function showSettingsWithUserManagement() {
    showSection('settings');
    checkUserCreationPermission();
    displayUsers();
}

// ============================================
// END OF FILE
// ============================================