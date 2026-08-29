// ============================================================
// WOODBUYY — UI HELPERS
// Toast, Modal, Skeleton Loader, Shared Utilities
// ============================================================

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - Auto-dismiss time in ms (default 4000)
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Limit to 3 toasts visible at once
  const existingToasts = container.querySelectorAll('.toast');
  if (existingToasts.length >= 3) {
    existingToasts[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  
  const icons = {
    success: 'ri-check-line',
    error: 'ri-close-line',
    warning: 'ri-alert-line',
    info: 'ri-information-line'
  };

  toast.innerHTML = `
    <i class="${icons[type] || icons.info}" style="font-size: var(--text-lg);"></i>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    }, { once: true });
  }, duration);
}

/**
 * Escape HTML to prevent XSS in toast messages
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// MODAL SYSTEM
// ============================================================

/**
 * Open a modal by ID
 * @param {string} modalId - The ID of the modal element
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Create overlay if not exists
  let overlay = document.querySelector('.overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
  }

  modal.classList.add('is-active');
  overlay.classList.add('is-active');
  document.body.style.overflow = 'hidden';

  // Close on overlay click
  overlay.addEventListener('click', () => closeModal(modalId), { once: true });
}

/**
 * Close a modal by ID
 * @param {string} modalId - The ID of the modal element
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  const overlay = document.querySelector('.overlay');
  
  if (modal) modal.classList.remove('is-active');
  if (overlay) overlay.classList.remove('is-active');
  document.body.style.overflow = '';
}

/**
 * Close all open modals
 */
export function closeAllModals() {
  document.querySelectorAll('.modal.is-active').forEach(modal => {
    modal.classList.remove('is-active');
  });
  const overlay = document.querySelector('.overlay');
  if (overlay) overlay.classList.remove('is-active');
  document.body.style.overflow = '';
}

// ============================================================
// SKELETON LOADERS
// ============================================================

/**
 * Generate skeleton HTML for product cards
 * @param {number} count - Number of skeleton cards
 * @returns {string} HTML string
 */
export function productCardSkeleton(count = 8) {
  return Array(count).fill(`
    <div class="product-card">
      <div class="skeleton skeleton-image"></div>
      <div class="product-card__body">
        <div class="skeleton skeleton-text skeleton-text--sm" style="width: 40%;"></div>
        <div class="skeleton skeleton-title" style="width: 90%;"></div>
        <div class="skeleton skeleton-text" style="width: 30%;"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Render skeletons into a container
 * @param {HTMLElement} container - Container element
 * @param {number} count - Number of skeletons
 */
export function renderSkeletons(container, count = 8) {
  if (!container) return;
  container.innerHTML = productCardSkeleton(count);
}

// ============================================================
// CURRENCY FORMATTER
// ============================================================

/**
 * Format fils to AED display string
 * @param {number} fils - Amount in fils (integer)
 * @returns {string} Formatted string like "AED 1,250.00"
 */
export function formatAED(fils) {
  if (fils === null || fils === undefined) return 'AED 0.00';
  const aed = fils / 100;
  return 'AED ' + aed.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format fils to AED number (for calculations)
 * @param {number} fils - Amount in fils
 * @returns {number} Amount in AED (float)
 */
export function filsToAED(fils) {
  return fils / 100;
}

/**
 * Convert AED to fils (integer)
 * @param {number} aed - Amount in AED
 * @returns {number} Amount in fils (rounded integer)
 */
export function aedToFils(aed) {
  return Math.round(aed * 100);
}

// ============================================================
// DEBOUNCE
// ============================================================

/**
 * Debounce a function call
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

/**
 * Get item from localStorage with JSON parsing
 */
export function getFromStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`[ui.js] Failed to parse localStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Set item in localStorage with JSON stringify
 */
export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[ui.js] Failed to set localStorage key "${key}":`, error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// ============================================================
// URL PARAMETERS
// ============================================================

/**
 * Get URL query parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null
 */
export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Build URL with query parameters
 * @param {string} base - Base URL
 * @param {Object} params - Key-value pairs
 * @returns {string} Full URL
 */
export function buildUrl(base, params = {}) {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

// ============================================================
// DOM HELPERS
// ============================================================

/**
 * Create DOM element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes object
 * @param {Array|string} children - Child elements or HTML string
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataVal]) => {
        el.dataset[dataKey] = dataVal;
      });
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  });

  if (typeof children === 'string') {
    el.innerHTML = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (child instanceof HTMLElement) {
        el.appendChild(child);
      }
    });
  }

  return el;
}

// ============================================================
// SCROLL HELPERS
// ============================================================

/**
 * Smooth scroll to top of page
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} True if in viewport
 */
export function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ============================================================
// DATE FORMATTER
// ============================================================

/**
 * Format Firestore timestamp to readable date
 * @param {Object|Date} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted date like "27 Aug 2026"
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isNaN(date.getTime())) return '—';
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format Firestore timestamp to full date-time
 * @param {Object|Date} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted date-time
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isNaN(date.getTime())) return '—';
  
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================
// ERROR HANDLER
// ============================================================

/**
 * Handle and display errors consistently
 * @param {Error|string} error - Error object or message
 * @param {string} fallbackMessage - Default message to show
 */
export function handleError(error, fallbackMessage = 'Something went wrong. Please try again.') {
  console.error('[Woodbuyy Error]:', error);
  
  const message = typeof error === 'string' 
    ? error 
    : (error?.message || fallbackMessage);
  
  showToast(message, 'error');
  
  return message;
}

// ============================================================
// LOADING STATE
// ============================================================

/**
 * Toggle loading state on a button
 * @param {HTMLElement} btn - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show while loading
 */
export function setButtonLoading(btn, isLoading, loadingText = 'Loading...') {
  if (!btn) return;
  
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
    delete btn.dataset.originalText;
  }
}
