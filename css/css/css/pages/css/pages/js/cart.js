// ============================================================
// WOODBUYY — CART SYSTEM
// Firestore-backed for logged-in users
// localStorage for guest users
// ============================================================

import { db, auth } from './firebase-config.js';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { showToast, getFromStorage, setToStorage, removeFromStorage } from './ui.js';

const GUEST_CART_KEY = 'wb_cart';

// ============================================================
// CART STATE
// ============================================================

let currentUser = null;
let cartItems = [];

// ============================================================
// AUTH STATE WATCHER
// ============================================================

onAuthStateChanged(auth, async (user) => {
  const wasGuest = currentUser === null && cartItems.length > 0;
  currentUser = user;
  
  if (user) {
    await loadCartFromFirestore(user.uid);
    
    // Merge guest cart if exists
    const guestCart = getGuestCart();
    if (guestCart.length > 0) {
      await mergeGuestCart(user.uid, guestCart);
      removeFromStorage(GUEST_CART_KEY);
    }
  } else {
    cartItems = getGuestCart();
  }
  
  updateCartUI();
});

// ============================================================
// GUEST CART (localStorage)
// ============================================================

function getGuestCart() {
  return getFromStorage(GUEST_CART_KEY, []);
}

function saveGuestCart(items) {
  setToStorage(GUEST_CART_KEY, items);
}

// ============================================================
// FIRESTORE CART
// ============================================================

async function loadCartFromFirestore(uid) {
  try {
    const cartRef = doc(db, 'carts', uid);
    const snapshot = await getDoc(cartRef);
    
    if (snapshot.exists()) {
      cartItems = snapshot.data().items || [];
    } else {
      cartItems = [];
    }
  } catch (error) {
    console.error('[cart.js] Failed to load cart:', error);
    cartItems = [];
  }
}

async function saveCartToFirestore(uid) {
  try {
    const cartRef = doc(db, 'carts', uid);
    await setDoc(cartRef, {
      uid,
      items: cartItems,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('[cart.js] Failed to save cart:', error);
    showToast('Failed to save cart', 'error');
  }
}

async function mergeGuestCart(uid, guestItems) {
  try {
    const cartRef = doc(db, 'carts', uid);
    const snapshot = await getDoc(cartRef);
    const existing = snapshot.exists() ? (snapshot.data().items || []) : [];
    
    const merged = [...existing];
    for (const item of guestItems) {
      const found = merged.find(i => 
        i.productId === item.productId && 
        JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
      );
      if (found) {
        found.quantity += item.quantity;
      } else {
        merged.push(item);
      }
    }
    
    cartItems = merged;
    await saveCartToFirestore(uid);
  } catch (error) {
    console.error('[cart.js] Failed to merge guest cart:', error);
  }
}

// ============================================================
// CART OPERATIONS
// ============================================================

/**
 * Add item to cart
 * @param {Object} item - Cart item { productId, name, slug, price, salePrice, quantity, image, attributes }
 */
export async function addToCart(item) {
  if (!item.productId || !item.name) {
    showToast('Invalid product', 'error');
    return;
  }
  
  const existing = cartItems.find(i => 
    i.productId === item.productId && 
    JSON.stringify(i.attributes || {}) === JSON.stringify(item.attributes || {})
  );
  
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cartItems.push({
      productId: item.productId,
      name: item.name,
      slug: item.slug || '',
      price: item.price,
      salePrice: item.salePrice || null,
      quantity: item.quantity || 1,
      image: item.image || '/assets/images/placeholder.jpg',
      attributes: item.attributes || {}
    });
  }
  
  await persistCart();
  showToast('Added to cart', 'success');
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 */
export async function removeFromCart(productId) {
  cartItems = cartItems.filter(i => i.productId !== productId);
  await persistCart();
  showToast('Removed from cart', 'info');
}

/**
 * Update item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export async function updateQuantity(productId, quantity) {
  const item = cartItems.find(i => i.productId === productId);
  if (!item) return;
  
  if (quantity <= 0) {
    await removeFromCart(productId);
    return;
  }
  
  item.quantity = quantity;
  await persistCart();
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  cartItems = [];
  await persistCart();
}

/**
 * Get all cart items
 * @returns {Array} Cart items
 */
export function getCartItems() {
  return [...cartItems];
}

/**
 * Get cart count (total items)
 * @returns {number} Total quantity
 */
export function getCartCount() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Get cart subtotal in fils
 * @returns {number} Subtotal in fils
 */
export function getCartSubtotal() {
  return cartItems.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + (price * item.quantity);
  }, 0);
}

// ============================================================
// PERSIST CART
// ============================================================

async function persistCart() {
  if (currentUser) {
    await saveCartToFirestore(currentUser.uid);
  } else {
    saveGuestCart(cartItems);
  }
  updateCartUI();
}

// ============================================================
// UI UPDATE
// ============================================================

function updateCartUI() {
  const count = getCartCount();
  const cartCountEls = document.querySelectorAll('#cartCount');
  
  cartCountEls.forEach(el => {
    if (count > 0) {
      el.textContent = count;
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
}

// ============================================================
// INIT — Load initial state
// ============================================================

if (currentUser) {
  loadCartFromFirestore(currentUser.uid);
} else {
  cartItems = getGuestCart();
}
updateCartUI();
