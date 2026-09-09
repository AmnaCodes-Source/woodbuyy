// ============================================
// WOODBUYY — WISHLIST SYSTEM
// localStorage-based (guest + logged-in both)
// ============================================

const WISHLIST_KEY = 'wb_wishlist';

// ============================================
// WISHLIST STATE
// ============================================

let wishlistItems = [];

// ============================================
// LOAD WISHLIST FROM STORAGE
// ============================================

function loadWishlist() {
    try {
        const saved = localStorage.getItem(WISHLIST_KEY);
        wishlistItems = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('[wishlist.js] Failed to load wishlist:', e);
        wishlistItems = [];
    }
    return wishlistItems;
}

// ============================================
// SAVE WISHLIST TO STORAGE
// ============================================

function saveWishlist() {
    try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
    } catch (e) {
        console.warn('[wishlist.js] Failed to save wishlist:', e);
    }
    updateWishlistUI();
}

// ============================================
// WISHLIST OPERATIONS
// ============================================

/**
 * Add product to wishlist
 * @param {string} productId - Product ID
 * @param {Object} productData - Product data (name, price, image, etc.)
 */
function addToWishlist(productId, productData = {}) {
    // Check if already in wishlist
    const existing = wishlistItems.find(item => item.productId === productId);
    
    if (existing) {
        showToast('Already in wishlist', 'info');
        return false;
    }
    
    wishlistItems.push({
        productId,
        name: productData.name || '',
        slug: productData.slug || '',
        price: parseInt(productData.price) || 0,
        salePrice: productData.salePrice ? parseInt(productData.salePrice) : null,
        image: productData.image || '',
        category: productData.category || '',
        addedAt: new Date().toISOString()
    });
    
    saveWishlist();
    showToast('Added to wishlist', 'success');
    return true;
}

/**
 * Remove product from wishlist
 * @param {string} productId - Product ID
 */
function removeFromWishlist(productId) {
    wishlistItems = wishlistItems.filter(item => item.productId !== productId);
    saveWishlist();
    showToast('Removed from wishlist', 'info');
    
    // Re-render wishlist page if on wishlist page
    if (document.getElementById('wishlistGrid')) {
        renderWishlistPage();
    }
}

/**
 * Toggle wishlist (add if not exists, remove if exists)
 * @param {string} productId - Product ID
 * @param {Object} productData - Product data
 */
function toggleWishlist(productId, productData = {}) {
    const existing = wishlistItems.find(item => item.productId === productId);
    
    if (existing) {
        removeFromWishlist(productId);
    } else {
        addToWishlist(productId, productData);
    }
}

/**
 * Check if product is in wishlist
 * @param {string} productId - Product ID
 * @returns {boolean}
 */
function isInWishlist(productId) {
    return wishlistItems.some(item => item.productId === productId);
}

/**
 * Get all wishlist items
 * @returns {Array}
 */
function getWishlistItems() {
    return [...wishlistItems];
}

/**
 * Get wishlist count
 * @returns {number}
 */
function getWishlistCount() {
    return wishlistItems.length;
}

/**
 * Clear entire wishlist
 */
function clearWishlist() {
    wishlistItems = [];
    saveWishlist();
}

// ============================================
// UI UPDATE
// ============================================

function updateWishlistUI() {
    const count = getWishlistCount();
    
    // Update all wishlist count elements
    document.querySelectorAll('[data-wishlist-count]').forEach(el => {
        if (count > 0) {
            el.textContent = count;
            el.style.display = 'flex';
        } else {
            el.textContent = '0';
            el.style.display = 'none';
        }
    });
    
    // Legacy support
    const legacyCount = document.getElementById('wishlistCount');
    if (legacyCount) {
        if (count > 0) {
            legacyCount.textContent = count;
            legacyCount.style.display = 'flex';
        } else {
            legacyCount.style.display = 'none';
        }
    }
    
    // Update heart icons on product cards
    document.querySelectorAll('[data-wishlist]').forEach(btn => {
        const productId = btn.dataset.wishlist;
        if (isInWishlist(productId)) {
            btn.classList.add('is-active');
            btn.querySelector('i')?.classList.remove('ri-heart-line');
            btn.querySelector('i')?.classList.add('ri-heart-fill');
        } else {
            btn.classList.remove('is-active');
            btn.querySelector('i')?.classList.remove('ri-heart-fill');
            btn.querySelector('i')?.classList.add('ri-heart-line');
        }
    });
}

// ============================================
// RENDER WISHLIST PAGE
// ============================================

function renderWishlistPage() {
    const container = document.getElementById('wishlistGrid');
    
    if (!container) return;
    
    if (wishlistItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="ri-heart-line"></i>
                </div>
                <h3 class="empty-state__title">Your wishlist is empty</h3>
                <p class="empty-state__text">Save your favorite furniture pieces here.</p>
                <a href="index.html" class="btn btn--primary btn--sm">Explore Products</a>
            </div>
        `;
        return;
    }
    
    let wishlistHTML = '';
    
    wishlistItems.forEach(item => {
        wishlistHTML += renderWishlistCard(item);
    });
    
    container.innerHTML = `
        <div class="wishlist-grid">
            ${wishlistHTML}
        </div>
    `;
    
    setupWishlistActions(container);
}

// ============================================
// RENDER WISHLIST CARD
// ============================================

function renderWishlistCard(item) {
    const productId = item.productId;
    const name = escapeHTML(item.name || 'Product');
    const displayPrice = item.salePrice || item.price || 0;
    const image = item.image || '';
    const category = escapeHTML(item.category || 'Furniture');
    
    return `
        <div class="wishlist-card" data-product-id="${productId}">
            <div class="wishlist-card-image" onclick="window.location.href='product.html?id=${productId}'">
                ${image ? `<img src="${image}" alt="${name}" loading="lazy" onerror="this.style.display='none'">` : '<i class="ri-image-line placeholder-icon"></i>'}
                <button class="wishlist-remove-btn" data-action="remove" title="Remove from wishlist" aria-label="Remove from wishlist">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
            <div class="wishlist-card-body">
                <div class="wishlist-card-name" onclick="window.location.href='product.html?id=${productId}'">${name}</div>
                <div class="wishlist-card-category">${category}</div>
                <div class="wishlist-card-footer">
                    <span class="wishlist-card-price">${formatCurrency(displayPrice)}</span>
                    <button class="wishlist-add-btn" data-action="add-to-cart" title="Add to cart" aria-label="Add to cart">
                        <i class="ri-shopping-cart-line"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SETUP WISHLIST ACTIONS
// ============================================

function setupWishlistActions(container) {
    // Remove from wishlist
    container.querySelectorAll('[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const card = btn.closest('.wishlist-card');
            const productId = card?.dataset.productId;
            
            if (!productId) return;
            
            removeFromWishlist(productId);
        });
    });
    
    // Add to cart
    container.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const card = btn.closest('.wishlist-card');
            const productId = card?.dataset.productId;
            
            if (!productId) {
                showToast('Product not found', 'error');
                return;
            }
            
            // Find wishlist item data
            const item = wishlistItems.find(i => i.productId === productId);
            
            if (!item) {
                showToast('Product not found', 'error');
                return;
            }
            
            // Add to cart using cart.js function
            if (typeof addToCart === 'function') {
                addToCart({
                    productId: item.productId,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    salePrice: item.salePrice,
                    quantity: 1,
                    image: item.image
                });
            } else {
                showToast('Cart system not available', 'error');
            }
        });
    });
}

// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ============================================
// INIT
// ============================================

// Load wishlist on page load
loadWishlist();
updateWishlistUI();

// If on wishlist page, render it
if (document.getElementById('wishlistGrid')) {
    renderWishlistPage();
}

console.log('[wishlist.js] Wishlist system loaded');
