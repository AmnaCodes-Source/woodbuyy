// ============================================================
// WOODBUYY — PRODUCTS
// Product fetching, filtering, rendering
// Firebase Compat — Vanilla JS
// ============================================================

const PRODUCTS_PER_PAGE = 20;

// ============================================================
// FETCH PRODUCTS (Paginated)
// ============================================================

/**
 * Fetch paginated products
 * @param {Object} options - Query options
 * @param {string} options.categorySlug - Filter by category slug
 * @param {boolean} options.featured - Only featured products
 * @param {string} options.sortBy - Sort field ('newest', 'price_low', 'price_high')
 * @param {number} options.limitCount - Number of products to fetch
 * @returns {Promise<Array>} Products array
 */
async function fetchProducts(options = {}) {
    try {
        const {
            categorySlug = null,
            featured = false,
            sortBy = 'newest',
            limitCount = PRODUCTS_PER_PAGE
        } = options;

        let query = db.collection('Products')  // Capital P
            .where('isActive', '==', true);

        if (featured) {
            query = query.where('isFeatured', '==', true);
        }

        if (categorySlug) {
            query = query.where('categorySlug', '==', categorySlug);
        }

        // Sorting
        switch (sortBy) {
            case 'price_low':
                query = query.orderBy('price', 'asc');
                break;
            case 'price_high':
                query = query.orderBy('price', 'desc');
                break;
            case 'newest':
            default:
                query = query.orderBy('createdAt', 'desc');
                break;
        }

        query = query.limit(limitCount);

        const snapshot = await query.get();

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return products;
    } catch (error) {
        console.error('[products.js] Failed to fetch products:', error);
        showToast('Failed to load products', 'error');
        return [];
    }
}

// ============================================================
// FETCH SINGLE PRODUCT
// ============================================================

/**
 * Fetch a single product by ID
 * @param {string} productId - Product document ID
 * @returns {Promise<Object|null>} Product data or null
 */
async function fetchProductById(productId) {
    try {
        const docRef = db.collection('Products').doc(productId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return {
            id: snapshot.id,
            ...snapshot.data()
        };
    } catch (error) {
        console.error('[products.js] Failed to fetch product:', error);
        showToast('Failed to load product', 'error');
        return null;
    }
}

// ============================================================
// FETCH CATEGORIES
// ============================================================

/**
 * Fetch all active categories
 * @param {number|null} level - Category level (1, 2, or 3) or null for all
 * @returns {Promise<Array>} Array of categories
 */
async function fetchCategories(level = null) {
    try {
        let query = db.collection('categories')  // small c
            .where('isActive', '==', true)
            .orderBy('order', 'asc');

        if (level) {
            query = query.where('level', '==', level);
        }

        const snapshot = await query.get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('[products.js] Failed to fetch categories:', error);
        showToast('Failed to load categories', 'error');
        return [];
    }
}

// ============================================================
// RENDER PRODUCT CARD
// ============================================================

/**
 * Generate product card HTML
 * @param {Object} product - Product data
 * @returns {string} HTML string
 */
function productCardHTML(product) {
    const displayPrice = product.salePrice || product.price;
    const hasSale = product.salePrice && product.salePrice < product.price;
    const salePercent = hasSale 
        ? Math.round((1 - product.salePrice / product.price) * 100) 
        : 0;

    const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'assets/images/placeholder.jpg';

    return `
        <article class="product-card" data-product-id="${product.id}" onclick="window.location.href='product.html?id=${product.id}'">
            <div class="product-card__image-wrap">
                <img 
                    class="product-card__image" 
                    src="${imageUrl}" 
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >
                ${hasSale ? `<span class="product-card__badge">-${salePercent}%</span>` : ''}
                <button 
                    class="product-card__wishlist" 
                    data-wishlist="${product.id}"
                    aria-label="Add to wishlist"
                    onclick="event.stopPropagation(); toggleWishlist('${product.id}')"
                >
                    <i class="ri-heart-line"></i>
                </button>
            </div>
            <div class="product-card__body">
                <p class="product-card__category">${escapeHTML(product.categoryName || 'Furniture')}</p>
                <h3 class="product-card__name">${escapeHTML(product.name)}</h3>
                <div class="product-card__price">
                    <span class="product-card__price-current">${formatCurrency(displayPrice)}</span>
                    ${hasSale ? `<span class="product-card__price-original">${formatCurrency(product.price)}</span>` : ''}
                </div>
            </div>
        </article>
    `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ============================================================
// RENDER PRODUCTS GRID
// ============================================================

/**
 * Render products into a grid container
 * @param {HTMLElement} container - Grid container element
 * @param {Array} products - Array of product objects
 */
function renderProducts(container, products) {
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state__icon">
                    <i class="ri-sofa-line"></i>
                </div>
                <h3 class="empty-state__title">No products found</h3>
                <p class="empty-state__text">
                    Try adjusting your filters or browse our categories.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(productCardHTML).join('');
}

// ============================================================
// RENDER SKELETONS
// ============================================================

/**
 * Show skeleton loaders in a container
 * @param {HTMLElement} container - Grid container
 * @param {number} count - Number of skeletons
 */
function renderSkeletons(container, count = 8) {
    if (!container) return;
    
    container.innerHTML = Array(count).fill(`
        <div class="product-card">
            <div class="skeleton skeleton-image"></div>
            <div class="product-card__body">
                <div class="skeleton skeleton-text skeleton-text--sm"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `).join('');
}

// ============================================================
// WISHLIST TOGGLE (calls wishlist.js if loaded)
// ============================================================

/**
 * Toggle wishlist — delegates to wishlist.js if available
 */
function toggleWishlist(productId) {
    if (typeof addToWishlist === 'function') {
        addToWishlist(productId);
    } else {
        showToast('Wishlist feature not available', 'warning');
    }
}

// ============================================================
// PRODUCT SEARCH (Client-side)
// ============================================================

/**
 * Search products by name (client-side filter)
 * @param {Array} products - Already loaded products
 * @param {string} searchTerm - Search input value
 * @returns {Array} Filtered products
 */
function searchProducts(products, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return products;
    
    const term = searchTerm.toLowerCase().trim();
    
    return products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(term))
    );
}

// ============================================================
// INIT
// ============================================================

console.log('[products.js] Products system loaded');
