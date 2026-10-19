// ============================================================
// WOODBUYY — CART SYSTEM
// localStorage-based
// ============================================================

const CART_KEY = 'wb_cart';
let cartItems = [];

function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        cartItems = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('[cart.js] Failed to load cart:', e);
        cartItems = [];
    }
    return cartItems;
}

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch (e) {
        console.warn('[cart.js] Failed to save cart:', e);
    }
    updateCartUI();
}

// Global function — renamed to avoid conflict with page-specific functions
window.addToCartFromCart = function(item) {
    if (!item.productId || !item.name || !item.price) {
        showToast('Invalid product', 'error');
        return false;
    }
    
    const existing = cartItems.find(i => i.productId === item.productId);
    
    if (existing) {
        existing.quantity += item.quantity || 1;
    } else {
        cartItems.push({
            productId: item.productId,
            name: item.name,
            slug: item.slug || '',
            price: parseInt(item.price),
            salePrice: item.salePrice ? parseInt(item.salePrice) : null,
            quantity: item.quantity || 1,
            image: item.image || '',
            attributes: item.attributes || {}
        });
    }
    
    saveCart();
    showToast('Added to cart', 'success');
    return true;
};

// Also keep addToCart as alias for backward compatibility
window.addToCart = window.addToCartFromCart;

function removeFromCart(productId) {
    cartItems = cartItems.filter(i => i.productId !== productId);
    saveCart();
    showToast('Removed from cart', 'info');
}

function updateQuantity(productId, quantity) {
    const item = cartItems.find(i => i.productId === productId);
    if (!item) return;
    
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    item.quantity = parseInt(quantity);
    saveCart();
}

function clearCart() {
    cartItems = [];
    saveCart();
}

function getCartItems() {
    return [...cartItems];
}

function getCartCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartSubtotal() {
    return cartItems.reduce((sum, item) => {
        const price = item.salePrice || item.price;
        return sum + (price * item.quantity);
    }, 0);
}

function updateCartUI() {
    const count = getCartCount();
    const cartCountEls = document.querySelectorAll('[data-cart-count]');
    
    cartCountEls.forEach(el => {
        if (count > 0) {
            el.textContent = count;
            el.style.display = 'flex';
        } else {
            el.textContent = '0';
            el.style.display = 'none';
        }
    });
    
    const legacyCartCount = document.getElementById('cartCount');
    if (legacyCartCount) {
        if (count > 0) {
            legacyCartCount.textContent = count;
            legacyCartCount.style.display = 'flex';
        } else {
            legacyCartCount.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartUI();
});

loadCart();
updateCartUI();

console.log('[cart.js] Cart system loaded');

// ============================================================
// ADD TO CART (Fixed Quantity Logic)
// ============================================================
function addToCart(item) {
  var cart = [];
  
  // Get existing cart from localStorage (guest cart)
  try {
    var stored = localStorage.getItem('wb_cart');
    if (stored) cart = JSON.parse(stored);
  } catch (e) {
    cart = [];
  }

  // Check if item already exists in cart
  var existingIndex = -1;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === item.productId) {
      // Check if attributes match (color/material)
      var sameColor = JSON.stringify(cart[i].attributes?.color) === JSON.stringify(item.attributes?.color);
      var sameMaterial = JSON.stringify(cart[i].attributes?.material) === JSON.stringify(item.attributes?.material);
      
      if (sameColor && sameMaterial) {
        existingIndex = i;
        break;
      }
    }
  }

  if (existingIndex > -1) {
    // Agar item pehle se hai, toh quantity barhao
    cart[existingIndex].quantity += (item.quantity || 1);
  } else {
    // Naya item add karo
    cart.push(item);
  }

  // Save back to localStorage
  localStorage.setItem('wb_cart', JSON.stringify(cart));
  
  return cart;
}

// Expose globally so product.js can use it
window.addToCart = addToCart;