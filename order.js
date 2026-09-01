// ============================================
// WOODBUYY — ORDERS PAGE LOGIC
// ============================================

let currentStatusFilter = 'all';
let allOrders = [];

// ---------- INIT ORDERS PAGE ----------
async function initOrders() {
    try {
        const user = await checkAuth();
        
        if (!user) {
            redirectTo('login.html');
            return;
        }
        
        await loadOrders(user.uid);
        setupFilters();
        setupLogout();
        
    } catch (error) {
        console.error('Orders init error:', error);
        showToast('Failed to load orders', 'error');
    }
}

// ---------- LOAD ORDERS ----------
async function loadOrders(uid) {
    const container = document.getElementById('ordersList');
    
    if (!container) return;
    
    try {
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', uid)
            .get();
        
        if (ordersSnapshot.empty) {
            container.innerHTML = `
                <div class="orders-empty">
                    <i class="ri-shopping-bag-line"></i>
                    <p>No orders found</p>
                    <a href="index.html" class="btn btn-primary btn-sm">Start Shopping</a>
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
        
        renderOrders(allOrders);
        
    } catch (error) {
        console.error('Load orders error:', error);
        container.innerHTML = `
            <div class="orders-empty">
                <i class="ri-error-warning-line"></i>
                <p>No orders found</p>
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
            <div class="orders-empty">
                <i class="ri-filter-line"></i>
                <p>No orders found</p>
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
    
    container.querySelectorAll('.order-card-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.order-card');
            card.classList.toggle('expanded');
        });
    });
}

// ---------- RENDER SINGLE ORDER CARD ----------
function renderOrderCard(order) {
    const orderId = order.orderId || order.id;
    const status = order.status || 'pending';
    const total = order.totalAmount || 0;
    const createdAt = order.createdAt ? order.createdAt.toDate() : new Date();
    const dateStr = createdAt.toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const statusClass = `status-${status.replace(/_/g, '-')}`;
    const statusLabel = status.replace(/_/g, ' ').toUpperCase();
    
    let itemsHTML = '';
    const items = order.items || [];
    
    items.forEach(item => {
        itemsHTML += `
            <div class="order-item">
                <div class="order-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='<i class=&quot;ri-image-line&quot;></i>'">` : '<i class="ri-image-line"></i>'}
                </div>
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-qty">Qty: ${item.quantity}</div>
                </div>
                <span class="order-item-price">${formatCurrency((item.salePrice || item.price) * item.quantity)}</span>
            </div>
        `;
    });
    
    const deliveryHTML = order.deliveryAddress ? `
        <div class="order-delivery-info">
            <div class="order-delivery-title">Delivery Address</div>
            <div class="order-delivery-detail">
                ${order.deliveryAddress.fullName || ''}<br>
                ${order.deliveryAddress.address || ''}<br>
                ${order.deliveryAddress.city || ''}, ${order.deliveryAddress.emirate || ''}<br>
                Phone: ${order.deliveryAddress.phone || ''}
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
                    <span class="order-status-badge ${statusClass}">${statusLabel}</span>
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
                        <span>${formatCurrency(order.subtotal || total)}</span>
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
        logoutBtn.addEventListener('click', logoutUser);
    }
}

// ---------- INIT ON DOM READY ----------
document.addEventListener('DOMContentLoaded', initOrders);

console.log('Woodbuyy Orders logic loaded');
