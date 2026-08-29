// ============================================================
// WOODBUYY — ORDERS
// Order creation and tracking
// ============================================================

import { db, auth } from './firebase-config.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  runTransaction
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast } from './ui.js';

// ============================================================
// GENERATE ORDER ID
// Format: WB-YYMMDD-XXXX
// ============================================================

async function generateOrderId() {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateKey = `${yy}${mm}${dd}`;

  const counterRef = doc(db, 'settings', `order_counter_${dateKey}`);

  const count = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const currentCount = snapshot.exists() ? snapshot.data().count : 0;
    const newCount = currentCount + 1;
    
    transaction.set(counterRef, {
      count: newCount,
      date: dateKey
    });
    
    return newCount;
  });

  return `WB-${dateKey}-${String(count).padStart(4, '0')}`;
}

// ============================================================
// CREATE ORDER
// ============================================================

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<string>} Order ID
 */
export async function createOrder(orderData) {
  try {
    // Validate required fields
    if (!orderData.customerName || !orderData.customerEmail || !orderData.customerPhone) {
      throw new Error('Customer information is required');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Cart is empty');
    }

    if (!orderData.address || !orderData.address.emirate || !orderData.address.city) {
      throw new Error('Delivery address is required');
    }

    // Generate order ID
    const orderId = await generateOrderId();

    // Get current user (if logged in)
    const user = auth.currentUser;
    const customerId = user ? user.uid : null;
    const isGuest = !user;

    // Build order document
    const order = {
      id: orderId,
      customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      isGuest,
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image || '/assets/images/placeholder.jpg',
        price: item.salePrice || item.price,
        quantity: item.quantity,
        attributes: item.attributes || {}
      })),
      subtotal: orderData.subtotal,
      vat: orderData.vat,
      shipping: orderData.shipping || 0,
      total: orderData.total,
      address: {
        line1: orderData.address.line1,
        line2: orderData.address.line2 || '',
        emirate: orderData.address.emirate,
        city: orderData.address.city,
        country: 'UAE'
      },
      paymentMethod: 'cod',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          at: serverTimestamp(),
          by: 'system'
        }
      ],
      notes: orderData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    await setDoc(doc(db, 'orders', orderId), order);

    // If guest user, create/update user doc
    if (isGuest) {
      await createGuestUserDoc(orderData.customerEmail, orderData.customerName, orderData.customerPhone);
    }

    showToast('Order placed successfully!', 'success');
    return orderId;

  } catch (error) {
    console.error('[orders.js] Failed to create order:', error);
    showToast(error.message || 'Failed to place order', 'error');
    throw error;
  }
}

// ============================================================
// GUEST USER DOC
// ============================================================

async function createGuestUserDoc(email, name, phone) {
  try {
    // Check if user with this email already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // User already exists — update phone if needed
      const existingUser = snapshot.docs[0];
      await setDoc(doc(db, 'users', existingUser.id), {
        phone: phone,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return;
    }

    // Create new guest user
    const userRef = doc(collection(db, 'users'));
    await setDoc(userRef, {
      uid: userRef.id,
      email,
      name,
      phone,
      role: 'customer',
      isGuest: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('[orders.js] Failed to create guest user:', error);
    // Don't throw — order is already created
  }
}

// ============================================================
// FETCH ORDER BY ID
// ============================================================

/**
 * Fetch a single order by ID
 * @param {string} orderId - Order ID (e.g., WB-260827-0001)
 * @returns {Promise<Object|null>} Order data or null
 */
export async function fetchOrderById(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const snapshot = await getDoc(orderRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    console.error('[orders.js] Failed to fetch order:', error);
    return null;
  }
}

// ============================================================
// FETCH ORDERS FOR USER
// ============================================================

/**
 * Fetch orders for current user
 * @param {string} uid - User ID
 * @returns {Promise<Array>} Array of orders
 */
export async function fetchUserOrders(uid) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('customerId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('[orders.js] Failed to fetch user orders:', error);
    return [];
  }
}

// ============================================================
// STATUS BADGE HELPER
// ============================================================

/**
 * Get status badge class and label
 * @param {string} status - Order status
 * @returns {string} HTML string for badge
 */
export function getStatusBadge(status) {
  const map = {
    pending: 'badge--pending',
    confirmed: 'badge--confirmed',
    in_progress: 'badge--progress',
    delivered: 'badge--delivered',
    completed: 'badge--completed',
    cancelled: 'badge--cancelled'
  };

  const label = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<span class="badge ${map[status] || 'badge--default'}">${label}</span>`;
}
