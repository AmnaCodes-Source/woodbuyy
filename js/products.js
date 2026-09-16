// ============================================================
// WOODBUYY — PRODUCTS
// Product fetching, filtering, rendering
// Firebase Compat — Vanilla JS
// ============================================================

const PRODUCTS_PER_PAGE = 20;

// ============================================================
// FETCH PRODUCTS
// ============================================================

async function fetchProducts(options = {}) {
    try {
        const {
            categorySlug = null,
            featured = false,
            limitCount = PRODUCTS_PER_PAGE
        } = options;

        let query = db.collection('Products')
            .where('isActive', '==', true);

        if (featured) {
            query = query.where('isFeatured', '==', true);
        }

        if (categorySlug) {
            query = query.where('categorySlug', '==', categorySlug);
        }

        query = query.limit(limitCount);

        const snapshot = await query.get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('[products.js] Failed to fetch products:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to load products', 'error');
        }
        return [];
    }
}

// ============================================================
// FETCH SINGLE PRODUCT
// ============================================================

async function fetchProductById(productId) {
    try {
        const docRef = db.collection('Products').doc(productId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) return null;

        return {
            id: snapshot.id,
            ...snapshot.data()
        };
    } catch (error) {
        console.error('[products.js] Failed to fetch product:', error);
        return null;
    }
}

// ============================================================
// FETCH CATEGORIES
// ============================================================

async function fetchCategories(level = null) {
    try {
        let query = db.collection('categories')
            .where('isActive', '==', true);

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
        return [];
    }
}

// ============================================================
// RENDER PRODUCT CARD
// ============================================================

function productCardHTML(product) {
    const displayPrice = product.salePrice || product.price;
    const hasSale = product.salePrice && product.salePrice < product.price;
    const salePercent = hasSale 
        ? Math.round((1 - product.salePrice / product.price) * 100) 
        : 0;

    const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';

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
            </div>
            <div class="product-card__body">
                <p class="product-card__category">${escapeHTML(product.categoryName || product.categorySlug || 'Furniture')}</p>
                <h3 class="product-card__name">${escapeHTML(product.name)}</h3>
                <div class="product-card__price">
                    <span class="product-card__price-current">${formatCurrency(displayPrice)}</span>
                    ${hasSale ? `<span class="product-card__price-original">${formatCurrency(product.price)}</span>` : ''}
                </div>
            </div>
        </article>
    `;
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ============================================================
// RENDER PRODUCTS GRID
// ============================================================

function renderProducts(container, products) {
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state__icon">
                    <i class="ri-sofa-line"></i>
                </div>
                <h3 class="empty-state__title">No products found</h3>
                <p class="empty-state__text">Try adjusting your filters or browse our categories.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(productCardHTML).join('');
}

// ============================================================
// RENDER SKELETONS
// ============================================================

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
// PRODUCT SEARCH (Client-side)
// ============================================================

function searchProducts(products, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return products;
    
    const term = searchTerm.toLowerCase().trim();
    
    return products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(term))
    );
}

console.log('[products.js] Products system loaded');