# ⚡ WOODBUYY CHEAT SHEET — v1.0.0
*Quick reference for daily development. Keep this open while building.*

---

## 🎨 COLORS — QUICK COPY

```
Background:     #0D0D0D   (page bg)
Background Alt: #141414   (section alt)
Surface:        #1C1C1C   (cards, modals)
Surface High:   #222222   (hover on cards)
Border:         #2E2E2E   (default border)
Border Light:   #242424   (subtle divider)

Text:           #F5F0E8   (primary)
Text Mid:       #B0A898   (secondary)
Text Muted:     #6E6860   (placeholder)
Text Inverse:   #0D0D0D   (text on gold)

Accent Gold:    #C9A96E   ← LOCKED
Accent Hover:   #B8944F
Accent Active:  #A07D38
Gold Shadow:    0 4px 20px rgba(201,169,110,0.20)

Success:        #4CAF7D
Warning:        #E5A443
Error:          #E05555
Info:           #5B9BD5
```

---

## 🔤 FONTS — QUICK COPY

```css
font-family: 'Cormorant Garamond', Georgia, serif;  /* Headings */
font-family: 'Jost', system-ui, sans-serif;          /* Body/UI */
```

**Google Fonts link tag:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600;1,700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
```

**Remix Icon:**
```html
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet">
```

---

## 📐 RADIUS & SHADOWS

```
Button radius:  2px   (--radius-sm)
Card radius:    4px   (--radius-md)
Modal radius:   6px   (--radius-lg)
Full (pill):    9999px

Shadow SM:  0 1px 4px rgba(0,0,0,0.4)
Shadow MD:  0 4px 16px rgba(0,0,0,0.5)
Shadow LG:  0 8px 32px rgba(0,0,0,0.6)
Gold Glow:  0 4px 20px rgba(201,169,110,0.20)
```

---

## 💰 MONEY — ALWAYS FILS

```javascript
// STORE in Firestore
price: 125000         // = AED 1,250.00

// DISPLAY only
function formatAED(fils) {
  return 'AED ' + (fils / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// formatAED(125000) → "AED 1,250.00"

// VAT calculation (5%)
const vatAmount = Math.round(subtotalFils * 0.05);
const total = subtotalFils + vatAmount + shippingFils;

// NEVER do this:
// price: 1250.00  ← WRONG (float)
// price: "1250"   ← WRONG (string)
```

---

## 🔥 FIREBASE SETUP

### HTML page head (every page that uses Firebase):
```html
<script type="module" src="/js/firebase-config.js"></script>
```

### firebase-config.js
```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const auth = getAuth(app);
```

---

## 📦 FIRESTORE — QUICK PATTERNS

### Read a document
```javascript
import { doc, getDoc } from 'firebase/firestore';

const ref = doc(db, 'products', productId);
const snap = await getDoc(ref);
if (snap.exists()) {
  const product = { id: snap.id, ...snap.data() };
}
```

### Query a collection
```javascript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'products'),
  where('isActive', '==', true),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const snaps = await getDocs(q);
const products = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
```

### Write a document
```javascript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

await setDoc(doc(db, 'orders', orderId), {
  ...orderData,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
```

### Update a document
```javascript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

await updateDoc(doc(db, 'orders', orderId), {
  status: 'confirmed',
  updatedAt: serverTimestamp()
});
```

### Real-time listener
```javascript
import { doc, onSnapshot } from 'firebase/firestore';

const unsub = onSnapshot(doc(db, 'carts', uid), (snap) => {
  if (snap.exists()) {
    const cart = snap.data();
    renderCart(cart);
  }
});
// Call unsub() to stop listening
```

---

## 🔐 AUTH — QUICK PATTERNS

```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword,
         signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';

// Login
await signInWithEmailAndPassword(auth, email, password);

// Register
const cred = await createUserWithEmailAndPassword(auth, email, password);
const uid = cred.user.uid;

// Logout
await signOut(auth);

// Password reset (Firebase built-in)
await sendPasswordResetEmail(auth, email);

// Auth state watcher (put in every page that needs auth)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // logged in
  } else {
    // logged out — redirect to /login.html
    window.location.href = '/login.html';
  }
});
```

---

## 🛒 CART — QUICK PATTERNS

### Guest cart (localStorage)
```javascript
function getGuestCart() {
  return JSON.parse(localStorage.getItem('wb_cart') || '[]');
}

function saveGuestCart(items) {
  localStorage.setItem('wb_cart', JSON.stringify(items));
}

function addToGuestCart(item) {
  const cart = getGuestCart();
  const existing = cart.find(i => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveGuestCart(cart);
}
```

### Merge guest cart on login
```javascript
async function mergeGuestCartOnLogin(uid) {
  const guestItems = getGuestCart();
  if (!guestItems.length) return;

  const cartRef = doc(db, 'carts', uid);
  const snap = await getDoc(cartRef);
  const existing = snap.exists() ? snap.data().items : [];

  const merged = [...existing];
  for (const item of guestItems) {
    const found = merged.find(i => i.productId === item.productId);
    if (found) found.quantity += item.quantity;
    else merged.push(item);
  }

  await setDoc(cartRef, { uid, items: merged, updatedAt: serverTimestamp() });
  localStorage.removeItem('wb_cart');
}
```

---

## 📋 ORDER ID GENERATOR

```javascript
// Run server-side (Cloud Function) — NOT client-side
async function generateOrderId(db) {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateKey = `${yy}${mm}${dd}`;

  // Use a counter doc to get daily sequence
  const counterRef = doc(db, 'settings', `order_counter_${dateKey}`);
  const result = await runTransaction(db, async (t) => {
    const snap = await t.get(counterRef);
    const count = snap.exists() ? snap.data().count + 1 : 1;
    t.set(counterRef, { count, date: dateKey });
    return count;
  });

  return `WB-${dateKey}-${String(result).padStart(4, '0')}`;
}
// → "WB-260827-0001"
```

---

## 🔔 TOAST — QUICK USE

```javascript
// ui.js exports:
showToast('Order placed successfully!', 'success');
showToast('Something went wrong. Try again.', 'error');
showToast('Item added to wishlist', 'info');
showToast('Please fill all required fields', 'warning');

// Auto-dismisses in 4 seconds
// Max 3 toasts visible at once
```

---

## 💀 SKELETON LOADER — QUICK USE

```html
<!-- Product card skeleton -->
<div class="product-card">
  <div class="skeleton skeleton-image"></div>
  <div class="card__body">
    <div class="skeleton skeleton-text skeleton-text--sm" style="width:40%"></div>
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text" style="width:30%"></div>
  </div>
</div>
```

```javascript
// Pattern: show skeletons → fetch → replace
function renderSkeletons(container, count = 8) {
  container.innerHTML = Array(count).fill(skeletonCardHTML).join('');
}

async function loadProducts() {
  renderSkeletons(grid, 8);
  const products = await fetchProducts();
  renderProducts(grid, products);
}
```

---

## 🏷 STATUS BADGE — QUICK USE

```html
<span class="badge badge--pending">Pending</span>
<span class="badge badge--confirmed">Confirmed</span>
<span class="badge badge--progress">In Progress</span>
<span class="badge badge--delivered">Delivered</span>
<span class="badge badge--completed">Completed</span>
<span class="badge badge--cancelled">Cancelled</span>
```

```javascript
function getStatusBadge(status) {
  const map = {
    pending:     'badge--pending',
    confirmed:   'badge--confirmed',
    in_progress: 'badge--progress',
    delivered:   'badge--delivered',
    completed:   'badge--completed',
    cancelled:   'badge--cancelled'
  };
  const label = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<span class="badge ${map[status] || 'badge--default'}">${label}</span>`;
}
```

---

## 📐 STANDARD PAGE TEMPLATE

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — Woodbuyy</title>
  <meta name="description" content="...">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600;1,700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">

  <!-- Icons -->
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet">

  <!-- CSS -->
  <link rel="stylesheet" href="/css/WOODBUYY_BRAND.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/pages/PAGE_NAME.css">
</head>
<body>

  <!-- Navbar -->
  <header id="navbar"></header>

  <!-- Main content -->
  <main>
    <!-- page content here -->
  </main>

  <!-- Footer -->
  <footer id="footer"></footer>

  <!-- Toast container -->
  <div id="toast-container"></div>

  <!-- JS (modules) -->
  <script type="module" src="/js/firebase-config.js"></script>
  <script type="module" src="/js/auth.js"></script>
  <script type="module" src="/js/ui.js"></script>
  <script type="module" src="/js/PAGE_NAME.js"></script>

</body>
</html>
```

---

## 🔒 ADMIN GUARD — EVERY ADMIN PAGE

```javascript
// admin-auth.js — import at top of every admin page JS
import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/admin/login.html';
    return;
  }
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists() || snap.data().role !== 'admin') {
    window.location.href = '/';
    return;
  }
  // User is admin — proceed
  initPage();
});
```

---

## 🧱 CSS VARIABLE USAGE RULE

```css
/* ✅ CORRECT — always use CSS variables */
background-color: var(--color-surface);
color: var(--color-text);
border: 1px solid var(--color-border);
border-radius: var(--radius-md);

/* ❌ WRONG — never hardcode brand values */
background-color: #1C1C1C;
color: #F5F0E8;
border-radius: 4px;
```

---

## 📱 BREAKPOINTS

```css
/* Mobile first — base styles are 375px */
/* Tablet */
@media (min-width: 768px) { }
/* Desktop */
@media (min-width: 1024px) { }
/* Wide */
@media (min-width: 1280px) { }
```

---

## ✅ PRE-COMMIT CHECKLIST

Before pushing any page or feature:

- [ ] Mobile layout tested at 375px
- [ ] All touch targets ≥ 44×44px
- [ ] No hardcoded colors — CSS variables only
- [ ] All money values stored as fils (integers)
- [ ] Error states handled + shown to user
- [ ] Loading states use skeletons (not spinners)
- [ ] Auth guard on protected pages
- [ ] Admin guard on all /admin/ pages
- [ ] Console.log removed (or behind debug flag)
- [ ] Firebase config not committed to git

---

## 🚀 DEPLOYMENT

### Push to GitHub
```bash
git add .
git commit -m "feat: description of change"
git push origin main
```

### Vercel auto-deploys on push to main.

### Manual deploy (if needed):
```bash
vercel --prod
```

### Environment variables in Vercel dashboard:
Settings → Environment Variables → Add each FIREBASE_* key

---

*End of Cheat Sheet (v1.0.0)*
