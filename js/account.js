// ============================================
// WOODBUYY — ACCOUNT DASHBOARD LOGIC
// ============================================

// ---------- CHECK AUTH ----------
async function initAccount() {
    try {
        const user = await checkAuth();
        
        if (!user) {
            // User not logged in — redirect to login
            redirectTo('login.html');
            return;
        }
        
        // Load user data
        await loadUserData(user);
        
        // Load stats
        await loadStats(user.uid);
        
        // Load recent orders
        await loadRecentOrders(user.uid);
        
    } catch (error) {
        console.error('Account init error:', error);
        showToast('Failed to load account data', 'error');
    }
}

// ---------- LOAD USER DATA ----------
async function loadUserData(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const firstName = userData.firstName || user.displayName?.split(' ')[0] || 'there';
            
            const welcomeEl = document.getElementById('welcomeMessage');
            if (welcomeEl) {
                welcomeEl.textContent = `Welcome, ${firstName}!`;
            }
        }
    } catch (error) {
        console.warn('Could not load user data:', error);
    }
}

// ---------- LOAD STATS ----------
async function loadStats(uid) {
    try {
        // Total orders
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', uid)
            .get();
        
        const totalOrdersEl = document.getElementById('totalOrders');
        if (totalOrdersEl) {
            totalOrdersEl.textContent = ordersSnapshot.size;
        }
        
        // Wishlist count
        const wishlistSnapshot = await db.collection('wishlist')
            .where('userId', '==', uid)
            .get();
        
        const wishlistCountEl = document.getElementById('wishlistCount');
        if (wishlistCountEl) {
            wishlistCountEl.textContent = wishlistSnapshot.size;
        }
        
        // Address count
        const addressesSnapshot = await db.collection('addresses')
            .where('userId', '==', uid)
            .get();
        
        const addressCountEl = document.getElementById('addressCount');
        if (addressCountEl) {
            addressCountEl.textContent = addressesSnapshot.size;
        }
        
    } catch (error) {
        console.warn('Could not load stats:', error);
    }
}

// ---------- LOAD RECENT ORDERS ----------
async function loadRecentOrders(uid) {
    const container = document.getElementById('recentOrders');
    
    if (!container) return;
    
    try {
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        if (ordersSnapshot.empty) {
            container.innerHTML = `
                <div class="account-empty">
                    <i class="ri-shopping-bag-line"></i>
                    <p>No orders yet</p>
                    <a href="index.html" class="btn btn-primary btn-sm">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        let ordersHTML = '';
        
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            const orderId = order.orderId || doc.id;
            const status = order.status || 'pending';
            const total = order.totalAmount || 0;
            const itemCount = order.items ? order.items.length : 0;
            
            const statusClass = `status-${status.replace(/_/g, '-')}`;
            const statusLabel = status.replace(/_/g, ' ').toUpperCase();
            
            ordersHTML += `
                <div class="account-order-card">
                    <div class="account-order-info">
                        <span class="account-order-id">${orderId}</span>
                        <div class="account-order-meta">
                            <span>${itemCount} item(s)</span>
                            <span class="account-order-status ${statusClass}">${statusLabel}</span>
                        </div>
                    </div>
                    <span class="account-order-amount">${formatCurrency(total)}</span>
                </div>
            `;
        });
        
        container.innerHTML = `
            <div class="account-orders-list">
                ${ordersHTML}
            </div>
        `;
        
    } catch (error) {
        console.warn('Could not load orders:', error);
        container.innerHTML = `
            <div class="account-empty">
                <i class="ri-error-warning-line"></i>
                <p>Failed to load orders</p>
            </div>
        `;
    }
}

// ---------- LOGOUT ----------
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // Initialize account page
    initAccount();
});

console.log('Woodbuyy Account logic loaded');
