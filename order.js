// ============================================
// WOODBUYY — ORDERS PAGE LOGIC
// ============================================

let currentStatusFilter = 'all';
let allOrders = [];

// ---------- INIT ORDERS PAGE ----------
async function initOrders() {
    try {
        // Check auth directly
        const user = await new Promise((resolve) => {
            const unsub = auth.onAuthStateChanged((user) => {
                unsub();
                resolve(user);
            });
        });
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        await loadOrders(user);
        setupFilters();
        setupLogout();
        
    } catch (error) {
        console.error('[orders.js] Init error:', error);
        showToast('Failed to load orders', 'error');
    }
}

// ---------- LOAD ORDERS ----------
async function loadOrders(user) {
    const container = document.getElementById('ordersList');
    
    if (!container) return;
    
    try {
        let query = db.collection('orders');
        
        // Filter by email OR userId (whichever exists)
        if (user.email) {
            query = query.where('customerEmail', '==', user.email);
        } else if (user.uid) {
            query = query.where('userId', '==', user.uid);
        }
        
        const ordersSnapshot = await query.get();
        
        if (ordersSnapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i class="ri-shopping-bag-line"></i>
                    </div>
                    <h3 class="empty-state__title">No orders found</h3>
                    <p class="empty-state__text">Your orders will appear here once you place them.</p>
                    <a href="index.html" class="btn btn--primary btn--sm">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        allOrders = [];
        
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            allOrders.push({
                id: doc.id,
                ...order
            });
        });
        
        // Sort by createdAt (newest first)
        allOrders.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return timeB - timeA;
        });
        
        renderOrders(allOrders);
        
    } catch (error) {
        console.error('[orders.js] Load orders error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="ri-error-warning-line"></i>
                </div>
                <h3 class="empty-state__title">Failed to load orders</h3>
                <p class="empty-state__text">Please try again later.</p>
            </div>
        `;
    }
}

// ---------- RENDER ORDERS ----------
function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="ri-filter-line"></i>
                </div>
                <h3 class="empty-state__title">No orders found</h3>
                <p class="empty-state__text">No orders match this filter.</p>
            </div>
        `;
        return;
    }
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        ordersHTML += renderOrderCard(order);
    });
    
    container.innerHTML = `
        <div class="orders-list">
            ${ordersHTML}
        </div>
    `;
    
    // Add click handlers for expand/collapse
    container.querySelectorAll('.order-card-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.order-card');
            card.classList.toggle('expanded');
        });
    });
}

// ---------- RENDER SINGLE ORDER CARD ----------
function renderOrderCard(order) {
    const orderId = order.id || order.orderId || 'Unknown';
    const status = order.status || 'pending';
    const total = order.total || 0;
    const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    const dateStr = createdAt.toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Use brand badge system
    const badgeMap = {
        pending: 'badge--pending',
        confirmed: 'badge--confirmed',
        in_progress: 'badge--progress',
        delivered: 'badge--delivered',
        completed: 'badge--completed',
        cancelled: 'badge--cancelled'
    };
    
    const badgeClass = badgeMap[status] || 'badge--default';
    const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    let itemsHTML = '';
    const items = order.items || [];
    
    items.forEach(item => {
        itemsHTML += `
            <div class="order-item">
                <div class="order-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${escapeHTML(item.name)}" onerror="this.style.display='none'">` : '<i class="ri-image-line"></i>'}
                </div>
                <div class="order-item-info">
                    <div class="order-item-name">${escapeHTML(item.name)}</div>
                    <div class="order-item-qty">Qty: ${item.quantity}</div>
                </div>
                <span class="order-item-price">${formatCurrency((item.salePrice || item.price) * item.quantity)}</span>
            </div>
        `;
    });
    
    // Delivery address from order.address (per schema)
    const address = order.address || {};
    const deliveryHTML = address.line1 ? `
        <div class="order-delivery-info">
            <div class="order-delivery-title">Delivery Address</div>
            <div class="order-delivery-detail">
                ${escapeHTML(order.customerName || '')}<br>
                ${escapeHTML(address.line1 || '')}<br>
                ${address.line2 ? escapeHTML(address.line2) + '<br>' : ''}
                ${escapeHTML(address.city || '')}, ${escapeHTML(address.emirate || '')}<br>
                Phone: ${escapeHTML(order.customerPhone || '')}
            </div>
        </div>
    ` : '';
    
    return `
        <div class="order-card">
            <div class="order-card-header">
                <div class="order-card-header-left">
                    <span class="order-id">${orderId}</span>
                    <span class="order-date">${dateStr}</span>
                </div>
                <div class="order-card-header-right">
                    <span class="badge ${badgeClass}">${statusLabel}</span>
                    <span class="order-amount">${formatCurrency(total)}</span>
                    <i class="ri-arrow-down-s-line order-toggle-icon"></i>
                </div>
            </div>
            <div class="order-details">
                <div class="order-items-list">
                    ${itemsHTML}
                </div>
                <div class="order-summary">
                    <div class="order-summary-row">
                        <span>Subtotal</span>
                        <span>${formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    <div class="order-summary-row">
                        <span>VAT (5%)</span>
                        <span>${formatCurrency(order.vat || 0)}</span>
                    </div>
                    <div class="order-summary-row">
                        <span>Shipping</span>
                        <span>${formatCurrency(order.shipping || 0)}</span>
                    </div>
                    <div class="order-summary-row total">
                        <span>Total</span>
                        <span>${formatCurrency(total)}</span>
                    </div>
                </div>
                ${deliveryHTML}
            </div>
        </div>
    `;
}

// ---------- ESCAPE HTML ----------
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ---------- SETUP FILTERS ----------
function setupFilters() {
    const filterContainer = document.getElementById('ordersFilters');
    
    if (!filterContainer) return;
    
    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.order-filter-btn');
        
        if (!btn) return;
        
        filterContainer.querySelectorAll('.order-filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        
        currentStatusFilter = btn.dataset.status;
        
        if (currentStatusFilter === 'all') {
            renderOrders(allOrders);
        } else {
            const filtered = allOrders.filter(order => order.status === currentStatusFilter);
            renderOrders(filtered);
        }
    });
}

// ---------- SETUP LOGOUT ----------
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('[orders.js] Logout error:', error);
            }
        });
    }
}

// ---------- INIT ON DOM READY ----------
document.addEventListener('DOMContentLoaded', initOrders);

console.log('[orders.js] Orders system loaded');
