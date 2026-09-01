// ============================================
// WOODBUYY — WISHLIST PAGE LOGIC
// ============================================

// ---------- INIT WISHLIST PAGE ----------
async function initWishlist() {
    try {
        const user = await checkAuth();
        
        if (!user) {
            redirectTo('login.html');
            return;
        }
        
        await loadWishlist(user.uid);
        setupLogout();
        
    } catch (error) {
        console.error('Wishlist init error:', error);
        showToast('Failed to load wishlist', 'error');
    }
}

// ---------- LOAD WISHLIST ----------
async function loadWishlist(uid) {
    const container = document.getElementById('wishlistGrid');
    
    if (!container) return;
    
    try {
        const wishlistSnapshot = await db.collection('wishlist')
            .where('userId', '==', uid)
            .get();
        
        if (wishlistSnapshot.empty) {
            container.innerHTML = `
                <div class="wishlist-empty">
                    <i class="ri-heart-line"></i>
                    <p>Your wishlist is empty</p>
                    <a href="index.html" class="btn btn-primary btn-sm">Explore Products</a>
                </div>
            `;
            return;
        }
        
        let wishlistHTML = '';
        const wishlistItems = [];
        
        wishlistSnapshot.forEach(doc => {
            wishlistItems.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        wishlistItems.forEach(item => {
            wishlistHTML += renderWishlistCard(item);
        });
        
        container.innerHTML = `
            <div class="wishlist-grid">
                ${wishlistHTML}
            </div>
        `;
        
        setupWishlistActions(container);
        
    } catch (error) {
        console.warn('Wishlist query error:', error.message);
        container.innerHTML = `
            <div class="wishlist-empty">
                <i class="ri-heart-line"></i>
                <p>Your wishlist is empty</p>
                <a href="index.html" class="btn btn-primary btn-sm">Explore Products</a>
            </div>
        `;
    }
}

// ---------- RENDER WISHLIST CARD ----------
function renderWishlistCard(item) {
    const productId = item.productId || item.id;
    const name = item.name || 'Product';
    const price = item.salePrice || item.price || 0;
    const image = item.image || '';
    const category = item.category || '';
    
    return `
        <div class="wishlist-card" data-id="${item.id}">
            <div class="wishlist-card-image" onclick="redirectTo('product.html?id=${productId}')">
                ${image ? `<img src="${image}" alt="${name}" onerror="this.parentElement.innerHTML='<i class=&quot;ri-image-line placeholder-icon&quot;></i>'">` : '<i class="ri-image-line placeholder-icon"></i>'}
                <button class="wishlist-remove-btn" data-action="remove" title="Remove from wishlist">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
            <div class="wishlist-card-body">
                <div class="wishlist-card-name" onclick="redirectTo('product.html?id=${productId}')">${name}</div>
                <div class="wishlist-card-category">${category}</div>
                <div class="wishlist-card-footer">
                    <span class="wishlist-card-price">${formatCurrency(price)}</span>
                    <button class="wishlist-add-btn" data-action="add-to-cart" title="Add to cart">
                        <i class="ri-shopping-cart-line"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ---------- SETUP WISHLIST ACTIONS ----------
function setupWishlistActions(container) {
    container.querySelectorAll('[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const card = btn.closest('.wishlist-card');
            const wishlistId = card.dataset.id;
            
            if (!wishlistId) return;
            
            try {
                await db.collection('wishlist').doc(wishlistId).delete();
                showToast('Removed from wishlist', 'success');
                card.remove();
                
                const remainingCards = container.querySelectorAll('.wishlist-card');
                if (remainingCards.length === 0) {
                    container.innerHTML = `
                        <div class="wishlist-empty">
                            <i class="ri-heart-line"></i>
                            <p>Your wishlist is empty</p>
                            <a href="index.html" class="btn btn-primary btn-sm">Explore Products</a>
                        </div>
                    `;
                }
                
            } catch (error) {
                console.error('Remove wishlist error:', error);
                showToast('Failed to remove', 'error');
            }
        });
    });
    
    container.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const card = btn.closest('.wishlist-card');
            const wishlistId = card.dataset.id;
            
            if (!wishlistId) {
                showToast('Product not found', 'error');
                return;
            }
            
            try {
                const user = await checkAuth();
                
                if (!user) {
                    redirectTo('login.html');
                    return;
                }
                
                // Get wishlist item data
                const wishlistDoc = await db.collection('wishlist').doc(wishlistId).get();
                
                if (!wishlistDoc.exists) {
                    showToast('Product not found', 'error');
                    return;
                }
                
                const product = wishlistDoc.data();
                const productId = product.productId || wishlistId;
                
                // Add to cart
                const cartRef = db.collection('cart').doc(user.uid);
                const cartDoc = await cartRef.get();
                
                let cartItems = [];
                if (cartDoc.exists && cartDoc.data().items) {
                    cartItems = cartDoc.data().items;
                }
                
                const existingIndex = cartItems.findIndex(item => item.productId === productId);
                
                if (existingIndex >= 0) {
                    cartItems[existingIndex].quantity += 1;
                } else {
                    cartItems.push({
                        productId,
                        name: product.name || 'Product',
                        slug: product.slug || '',
                        price: product.price || 0,
                        salePrice: product.salePrice || product.price || 0,
                        quantity: 1,
                        image: product.image || '',
                        attributes: {}
                    });
                }
                
                await cartRef.set({
                    userId: user.uid,
                    items: cartItems,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                showToast('Added to cart!', 'success');
                
            } catch (error) {
                console.error('Add to cart error:', error);
                showToast('Failed to add to cart', 'error');
            }
        });
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
document.addEventListener('DOMContentLoaded', initWishlist);

console.log('Woodbuyy Wishlist logic loaded');
