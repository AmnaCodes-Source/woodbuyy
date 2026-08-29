// ============================================================
// WOODBUYY — PRODUCTS
// Product fetching, filtering, rendering
// ============================================================

import { db } from './firebase-config.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { formatAED, renderSkeletons, handleError } from './ui.js';

// ============================================================
// PRODUCTS PER PAGE
// ============================================================

const PRODUCTS_PER_PAGE = 20;

// ============================================================
// FETCH PRODUCTS (Paginated)
// ============================================================

/**
 * Fetch paginated products
 * @param {Object} options - Query options
 * @param {string} options.categorySlug - Filter by category slug
 * @param {string} options.search - Search term
 * @param {boolean} options.featured - Only featured products
 * @param {string} options.sortBy - Sort field ('newest', 'price_low', 'price_high')
 * @param {Object|null} options.lastDoc - Last document for pagination
 * @returns {Promise<{products: Array, lastDoc: Object|null}>}
 */
export async function fetchProducts(options = {}) {
  try {
    const {
      categorySlug = null,
      search = null,
      featured = false,
      sortBy = 'newest',
      lastDoc = null
    } = options;

    let q = collection(db, 'products');
    let constraints = [where('isActive', '==', true)];

    if (featured) {
      constraints.push(where('isFeatured', '==', true));
    }

    if (categorySlug) {
      constraints.push(where('categorySlug', '==', categorySlug));
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        constraints.push(orderBy('price', 'asc'));
        break;
      case 'price_high':
        constraints.push(orderBy('price', 'desc'));
        break;
      case 'newest':
      default:
        constraints.push(orderBy('createdAt', 'desc'));
        break;
    }

    constraints.push(limit(PRODUCTS_PER_PAGE));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(q, ...constraints);
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const newLastDoc = snapshot.docs.length === PRODUCTS_PER_PAGE 
      ? snapshot.docs[snapshot.docs.length - 1] 
      : null;

    return {
      products,
      lastDoc: newLastDoc
    };
  } catch (error) {
    handleError(error, 'Failed to load products.');
    return { products: [], lastDoc: null };
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
export async function fetchProductById(productId) {
  try {
    const docRef = doc(db, 'products', productId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    handleError(error, 'Failed to load product.');
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
export async function fetchCategories(level = null) {
  try {
    let q = collection(db, 'categories');
    let constraints = [
      where('isActive', '==', true),
      orderBy('order', 'asc')
    ];

    if (level) {
      constraints.push(where('level', '==', level));
    }

    const querySnapshot = await getDocs(query(q, ...constraints));

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleError(error, 'Failed to load categories.');
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
export function productCardHTML(product) {
  const displayPrice = product.salePrice || product.price;
  const hasSale = product.salePrice && product.salePrice < product.price;
  const salePercent = hasSale 
    ? Math.round((1 - product.salePrice / product.price) * 100) 
    : 0;

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : '/assets/images/placeholder.jpg';

  return `
    <article class="product-card" data-product-id="${product.id}" onclick="window.location.href='/product.html?id=${product.id}'">
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
          <span class="product-card__price-current">${formatAED(displayPrice)}</span>
          ${hasSale ? `<span class="product-card__price-original">${formatAED(product.price)}</span>` : ''}
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
export function renderProducts(container, products) {
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
// WISHLIST TOGGLE (Placeholder — full logic in wishlist.js)
// ============================================================

/**
 * Toggle wishlist — placeholder for wishlist.js integration
 */
export function toggleWishlist(productId) {
  // Will be implemented in Phase 4 (wishlist.js)
  import('./ui.js').then(({ showToast }) => {
    showToast('Wishlist coming soon', 'info');
  });
}

// ============================================================
// PRODUCT SEARCH
// ============================================================

/**
 * Search products by name (client-side filter)
 * @param {Array} products - Already loaded products
 * @param {string} searchTerm - Search input value
 * @returns {Array} Filtered products
 */
export function searchProducts(products, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') return products;
  
  const term = searchTerm.toLowerCase().trim();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(term) ||
    (product.categoryName && product.categoryName.toLowerCase().includes(term))
  );
}
