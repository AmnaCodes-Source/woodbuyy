# 🗺 WOODBUYY PROJECT MAP — v1.0.0
*Updated: August 2026*

---

## BUILD PHASE TRACKER

| Phase | Description                          | Status     |
|-------|--------------------------------------|------------|
| 0     | Setup & infrastructure               | ⬜ Next    |
| 1     | Brand system & global CSS            | ✅ Done    |
| 2     | Core pages (home, products, product) | ⬜         |
| 3     | Cart & checkout (COD)                | ⬜         |
| 4     | Customer account pages               | ⬜         |
| 5     | Admin panel                          | ⬜         |
| 6     | Firebase rules & security            | ⬜         |
| 7     | QA, polish & performance             | ⬜         |
| 8     | Launch (Vercel + domain)             | ⬜         |

---

## STORE PAGES — woodbuyy.com

### Public Pages (11)

| File                    | Route             | Status | Notes                           |
|-------------------------|-------------------|--------|---------------------------------|
| index.html              | /                 | ⬜     | Homepage — hero, featured, cats |
| products.html           | /products         | ⬜     | Grid + filters + pagination     |
| product.html            | /product?id=      | ⬜     | Detail, images, add to cart     |
| categories.html         | /categories       | ⬜     | All category tiles              |
| category.html           | /category?slug=   | ⬜     | Products filtered by category   |
| about.html              | /about            | ⬜     | Brand story                     |
| contact.html            | /contact          | ⬜     | Contact form + Firebase write   |
| faq.html                | /faq              | ⬜     | Accordion FAQ                   |
| terms.html              | /terms            | ⬜     | Terms & Conditions              |
| privacy.html            | /privacy          | ⬜     | Privacy Policy                  |
| shipping.html           | /shipping         | ⬜     | Shipping policy + rates table   |

### Shopping Pages (3)

| File                    | Route             | Status | Notes                           |
|-------------------------|-------------------|--------|---------------------------------|
| cart.html               | /cart             | ⬜     | Cart items, totals, checkout CTA|
| checkout.html           | /checkout         | ⬜     | Address, COD confirm, VAT       |
| order-success.html      | /order-success    | ⬜     | Confirmation, order ID          |

### Customer Auth Pages (3)

| File                    | Route             | Status | Notes                           |
|-------------------------|-------------------|--------|---------------------------------|
| login.html              | /login            | ⬜     | Email + password, remember me   |
| register.html           | /register         | ⬜     | Name, email, password           |
| forgot-password.html    | /forgot-password  | ⬜     | Firebase password reset         |

### Customer Account Pages (6)

| File                    | Route             | Status | Notes                           |
|-------------------------|-------------------|--------|---------------------------------|
| account.html            | /account          | ⬜     | Overview, quick stats           |
| account-orders.html     | /account/orders   | ⬜     | Order history + status          |
| account-order-detail.html | /account/orders/[id] | ⬜ | Single order, items, timeline   |
| account-wishlist.html   | /account/wishlist | ⬜     | Saved products                  |
| account-addresses.html  | /account/addresses| ⬜     | CRUD saved addresses            |
| account-profile.html    | /account/profile  | ⬜     | Name, email, phone, password    |

**Store Total: 23 pages**

---

## ADMIN PANEL — woodbuyy.com/admin/

| File                    | Route                  | Status | Notes                          |
|-------------------------|------------------------|--------|--------------------------------|
| admin/login.html        | /admin/login           | ⬜     | Separate admin login           |
| admin/index.html        | /admin                 | ⬜     | Dashboard, stats, recent       |
| admin/products.html     | /admin/products        | ⬜     | List, search, filter           |
| admin/product-new.html  | /admin/product-new     | ⬜     | Add product form               |
| admin/product-edit.html | /admin/product-edit?id | ⬜     | Edit product form              |
| admin/orders.html       | /admin/orders          | ⬜     | All orders, filter by status   |
| admin/order-detail.html | /admin/order-detail?id | ⬜     | Full order, status update      |
| admin/customers.html    | /admin/customers       | ⬜     | Customer list, search          |
| admin/categories.html   | /admin/categories      | ⬜     | Category CRUD                  |
| admin/settings.html     | /admin/settings        | ⬜     | VAT, COD, shipping rates       |

**Admin Total: 10 pages**

**Grand Total: 33 pages**

---

## FILE STRUCTURE

```
woodbuyy/
│
├── index.html
├── products.html
├── product.html
├── categories.html
├── category.html
├── cart.html
├── checkout.html
├── order-success.html
├── about.html
├── contact.html
├── faq.html
├── terms.html
├── privacy.html
├── shipping.html
├── login.html
├── register.html
├── forgot-password.html
├── account.html
├── account-orders.html
├── account-order-detail.html
├── account-wishlist.html
├── account-addresses.html
├── account-profile.html
│
├── admin/
│   ├── login.html
│   ├── index.html
│   ├── products.html
│   ├── product-new.html
│   ├── product-edit.html
│   ├── orders.html
│   ├── order-detail.html
│   ├── customers.html
│   ├── categories.html
│   └── settings.html
│
├── css/
│   ├── WOODBUYY_BRAND.css        ← DESIGN SYSTEM (source of truth)
│   ├── components.css            ← Navbar, footer, shared UI
│   └── pages/
│       ├── home.css
│       ├── products.css
│       ├── product.css
│       ├── cart.css
│       ├── checkout.css
│       ├── account.css
│       └── admin.css
│
├── js/
│   ├── firebase-config.js        ← Firebase init (public keys only)
│   ├── auth.js                   ← Auth state, login, register, logout
│   ├── cart.js                   ← Cart (Firestore + localStorage guest)
│   ├── products.js               ← Product fetch + render
│   ├── orders.js                 ← Order creation + tracking
│   ├── wishlist.js               ← Wishlist toggle + sync
│   ├── ui.js                     ← Toast, modal, skeleton, helpers
│   └── admin/
│       ├── admin-auth.js
│       ├── admin-products.js
│       ├── admin-orders.js
│       ├── admin-customers.js
│       └── admin-categories.js
│
├── assets/
│   ├── images/
│   │   ├── logo.svg
│   │   └── placeholder.jpg
│   └── icons/
│
└── firebase/
    └── firestore.rules
```

---

## FIRESTORE COLLECTIONS

| Collection       | Description                           | Status |
|------------------|---------------------------------------|--------|
| users/           | Auth users (admin, customer, guest)   | ⬜     |
| products/        | Furniture catalog                     | ⬜     |
| categories/      | Product categories (level 1/2/3)      | ⬜     |
| orders/          | All orders (WB-YYMMDD-XXXX)           | ⬜     |
| carts/           | Firestore cart per user               | ⬜     |
| wishlist/        | Customer wishlists                    | ⬜     |
| reviews/         | Product reviews                       | ⬜     |
| customQuotes/    | Custom furniture requests             | ⬜     |
| supportTickets/  | Help tickets + messages subcollection | ⬜     |
| settings/        | Global config (VAT, COD, shipping)    | ⬜     |
| addresses/       | Customer saved addresses              | ⬜     |

---

## FIRESTORE SCHEMAS

### users/{uid}
```
{
  uid: string,
  email: string,
  name: string,
  phone: string,
  role: 'admin' | 'customer',
  isGuest: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### products/{productId}
```
{
  id: string,
  name: string,
  slug: string,
  description: string,
  categoryId: string,
  categorySlug: string,
  price: number,          // integer fils
  salePrice: number|null, // integer fils
  images: string[],       // Cloudflare R2 URLs
  attributes: {
    material: string,
    color: string[],
    dimensions: { W: number, D: number, H: number }, // cm
    weight: number         // kg
  },
  inStock: boolean,
  stockCount: number,
  isActive: boolean,
  isFeatured: boolean,
  rating: number,         // 0.0–5.0
  reviewCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### categories/{categoryId}
```
{
  id: string,
  name: string,
  slug: string,
  image: string,          // R2 URL
  parentId: string|null,  // null = level 1
  level: 1 | 2 | 3,
  order: number,
  isActive: boolean,
  createdAt: timestamp
}
```

### orders/{orderId}
```
{
  id: string,             // WB-YYMMDD-XXXX
  customerId: string,     // users/{uid}
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  isGuest: boolean,
  items: [
    {
      productId: string,
      name: string,
      image: string,
      price: number,      // fils at time of order
      quantity: number,
      attributes: object
    }
  ],
  subtotal: number,       // fils
  vat: number,            // fils (5%)
  shipping: number,       // fils
  total: number,          // fils
  address: {
    line1: string,
    line2: string,
    emirate: string,
    city: string,
    country: 'UAE'
  },
  paymentMethod: 'cod',
  status: 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'completed' | 'cancelled',
  statusHistory: [
    { status: string, at: timestamp, by: string }
  ],
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### carts/{uid}
```
{
  uid: string,
  items: [
    {
      productId: string,
      name: string,
      slug: string,
      price: number,      // fils
      salePrice: number|null,
      quantity: number,
      image: string,
      attributes: object
    }
  ],
  updatedAt: timestamp
}
```

### settings/global
```
{
  vatRate: number,         // 0.05 (5%)
  codEnabled: boolean,
  shippingRates: {
    'Dubai':        number,  // fils
    'Abu Dhabi':    number,
    'Sharjah':      number,
    'Ajman':        number,
    'Ras Al Khaimah': number,
    'Fujairah':     number,
    'Umm Al Quwain': number
  },
  freeShippingThreshold: number  // fils
}
```

---

## ORDER STATUS FLOW

```
pending
  ↓
confirmed   ←→   cancelled (from pending/confirmed only)
  ↓
in_progress
  ↓
delivered
  ↓
completed   (LOCKED — no further transitions)
```

**Rules:**
- cancelled: only from `pending` or `confirmed`
- completed: LOCKED (no reversal)
- delivered → completed: requires admin action
- Status change always writes to `statusHistory[]`

---

## ORDER ID FORMAT

`WB-YYMMDD-XXXX`

Examples:
- WB-260827-0001
- WB-260827-0042
- WB-261201-0108

XXXX = daily sequential counter (reset each day, zero-padded to 4 digits)

---

## CDN DEPENDENCIES

All loaded via `<link>` or `<script>` tags in HTML — no npm required.

| Library        | CDN URL                                                                 | Purpose          |
|----------------|-------------------------------------------------------------------------|------------------|
| Remix Icon     | https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css       | Icons            |
| Google Fonts   | https://fonts.googleapis.com (Cormorant Garamond + Jost)               | Typography       |
| Firebase SDK   | https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js (ESM)        | Auth + Firestore |

No jQuery. No Bootstrap. No React. Vanilla only.

---

## VERCEL DEPLOYMENT

| Setting         | Value                         |
|-----------------|-------------------------------|
| Framework       | Other (static)                |
| Root Directory  | / (root of repo)              |
| Build Command   | (none — static HTML)          |
| Output Directory| . (root)                      |
| Install Command | (none)                        |

Environment Variables (set in Vercel dashboard):
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID

*Note: Firebase config values are public — safe to expose in frontend JS.*

---

## GITHUB REPO STRUCTURE

```
woodbuyy/              ← repo root
├── .gitignore
├── README.md
├── vercel.json        ← Vercel routing config
└── [all project files as above]
```

### vercel.json
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/admin/(.*)", "destination": "/admin/$1.html" }
  ]
}
```

---

## ACTIVE BACKLOG (build on request)

1. Product search (real-time Firestore query)
2. Product reviews (customer submit, public view)
3. Custom quote request form
4. Newsletter subscribe (Firestore subscribers collection)
5. WhatsApp order notification (WhatsApp Business API)
6. Product image zoom on detail page
7. Recently viewed products (localStorage)
8. Related products section
9. Order tracking page (public, by order ID)
10. Support ticket system

---

## FUTURE BACKLOG (do not build yet)

- BNPL (Tabby/Tamara)
- Seller/affiliate system
- Blog/editorial section
- Product comparison
- AR view-in-room
- SMS notifications
- Gift cards
- Bundle offers
- Multi-language (Arabic)
- Mobile app (PWA)

---

*End of Project Map (v1.0.0)*
