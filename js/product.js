// ============================================================
// PRODUCT PAGE - js/product.js
// Reads ?id= from URL, fetches product, renders all sections.
// Money in fils; divide by 100 at display only.
// ============================================================

import { db } from './firebase-config.js';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast } from './ui.js';
import { addToCart } from './cart.js';

// ---------- Helpers ----------
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatAED(fils) {
  if (fils == null) return 'AED 0.00';
  var n = (fils / 100).toFixed(2);
  var parts = n.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'AED ' + parts.join('.');
}

function renderStars(rating) {
  var full = Math.floor(rating);
  var half = rating - full >= 0.5;
  var empty = 5 - full - (half ? 1 : 0);
  var html = '';
  for (var i = 0; i < full; i++) html += '<i class="ri-star-fill"></i>';
  if (half) html += '<i class="ri-star-half-fill"></i>';
  for (var j = 0; j < empty; j++) html += '<i class="ri-star-line"></i>';
  return html;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' })[c];
  });
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val == null ? '' : val;
}

// ---------- State ----------
var currentProduct = null;
var selectedColor = null;
var selectedMaterial = null;
var selectedQty = 1;
var galleryIndex = 0;
var galleryImages = [];

// ---------- Load product ----------
async function loadProduct() {
  var id = getParam('id');
  if (!id) {
    showToast('No product specified', 'error');
    return;
  }
  try {
    var snap = await getDoc(doc(db, 'products', id));
    if (!snap.exists()) {
      showToast('Product not found', 'error');
      return;
    }
    currentProduct = Object.assign({ id: snap.id }, snap.data());
    renderProduct(currentProduct);
    loadRelated(currentProduct);
    loadReviews(currentProduct.id);
  } catch (err) {
    console.error('loadProduct failed', err);
    showToast('Could not load product', 'error');
  }
}

// ---------- Render ----------
function renderProduct(p) {
  document.title = p.name + ' - Woodbuyy';
  setText('breadcrumbName', p.name);
  setText('productCategory', (p.categorySlug || 'furniture').replace(/-/g, ' '));
  setText('productName', p.name);
  setText('productSku', p.sku ? 'SKU: ' + p.sku : '');
  setText('productSubtitle', p.description ? p.description.slice(0, 160) : '');
  setText('productReviews', (p.reviewCount || 0) + ' reviews');

  var starsEl = document.getElementById('productStars');
  if (starsEl) starsEl.innerHTML = renderStars(p.rating || 0);

  var price = p.salePrice != null ? p.salePrice : p.price;
  setText('productPrice', formatAED(price));

  if (p.salePrice != null && p.price > p.salePrice) {
    setText('productPriceOriginal', formatAED(p.price));
    setText('productSave', 'Save ' + formatAED(p.price - p.salePrice));
  }

  var dims = p.attributes && p.attributes.dimensions;
  var dimline = '';
  if (dims) {
    var parts = [];
    if (dims.H) parts.push('H ' + dims.H + ' cm');
    if (dims.W) parts.push('W ' + dims.W + ' cm');
    if (dims.D) parts.push('D ' + dims.D + ' cm');
    dimline = parts.join('  |  ');
  }
  setText('productDimLine', dimline);

  galleryImages = p.images || [];
  galleryIndex = 0;
  renderGallery();
  renderColors(p.attributes && p.attributes.color);
  renderMaterials(p.attributes && p.attributes.materials);
  renderFeatures(p.features);
  renderDimensions(dims, p.attributes && p.attributes.weight);
  setText('assemblyNote', p.attributes && p.attributes.assembly ? 'Assembly: ' + p.attributes.assembly : '');
  setText('materialText', (p.attributes && p.attributes.material) || '-');
  setText('careText', (p.attributes && p.attributes.care) || '-');

  var badge = document.getElementById('galleryBadge');
  if (badge && p.isFeatured) {
    badge.textContent = 'Featured';
    badge.classList.add('is-visible');
  }
}

// ---------- Gallery ----------
function renderGallery() {
  var main = document.getElementById('mainImage');
  var strip = document.getElementById('thumbStrip');
  var skeleton = document.getElementById('gallerySkeleton');
  if (!main || !strip) return;
  if (!galleryImages.length) return;
  if (skeleton) skeleton.style.display = 'none';
  main.src = galleryImages[galleryIndex];
  main.classList.add('is-loaded');
  strip.innerHTML = '';
  galleryImages.forEach(function (url, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'product-thumb' + (i === galleryIndex ? ' is-active' : '');
    var img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.loading = 'lazy';
    btn.appendChild(img);
    btn.addEventListener('click', function () { goToImage(i); });
    strip.appendChild(btn);
  });
}

function goToImage(i) {
  if (!galleryImages.length) return;
  galleryIndex = (i + galleryImages.length) % galleryImages.length;
  var main = document.getElementById('mainImage');
  if (main) main.src = galleryImages[galleryIndex];
  var thumbs = document.querySelectorAll('.product-thumb');
  thumbs.forEach(function (t, idx) {
    t.classList.toggle('is-active', idx === galleryIndex);
  });
}

function initGalleryNav() {
  var prev = document.getElementById('galleryPrev');
  var next = document.getElementById('galleryNext');
  if (prev) prev.addEventListener('click', function () { goToImage(galleryIndex - 1); });
  if (next) next.addEventListener('click', function () { goToImage(galleryIndex + 1); });
}

// ---------- Swatches / materials ----------
function renderColors(colors) {
  var row = document.getElementById('colorSwatches');
  var group = document.getElementById('colorGroup');
  if (!row) return;
  if (!colors || !colors.length) {
    if (group) group.style.display = 'none';
    return;
  }
  row.innerHTML = '';
  colors.forEach(function (c) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.style.backgroundColor = c.hex || c;
    btn.title = c.name || c;
    btn.setAttribute('aria-label', 'Colour: ' + (c.name || c));
    btn.addEventListener('click', function () {
      row.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('is-active'); });
      btn.classList.add('is-active');
      selectedColor = c;
    });
    row.appendChild(btn);
  });
  row.firstChild.classList.add('is-active');
}

function renderMaterials(materials) {
  var sel = document.getElementById('materialSelect');
  var group = document.getElementById('materialGroup');
  if (!sel) return;
  if (!materials || !materials.length) {
    if (group) group.style.display = 'none';
    return;
  }
  materials.forEach(function (m) {
    var opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', function () { selectedMaterial = sel.value || null; });
}

// ---------- Features / dimensions ----------
function renderFeatures(features) {
  var list = document.getElementById('featureList');
  if (!list) return;
  if (!features || !features.length) {
    list.innerHTML = '<li>No features listed.</li>';
    return;
  }
  list.innerHTML = features.map(function (f) {
    return '<li>' + escapeHtml(f) + '</li>';
  }).join('');
}

function renderDimensions(dims, weight) {
  setText('dimWidth', dims && dims.W ? dims.W + ' cm' : '-');
  setText('dimDepth', dims && dims.D ? dims.D + ' cm' : '-');
  setText('dimHeight', dims && dims.H ? dims.H + ' cm' : '-');
  setText('dimWeight', weight ? weight + ' kg' : '-');
}

// ---------- Related ----------
async function loadRelated(p) {
  var grid = document.getElementById('relatedGrid');
  if (!grid || !p.categoryId) return;
  try {
    var q = query(
      collection(db, 'products'),
      where('categoryId', '==', p.categoryId),
      where('isActive', '==', true),
      limit(4)
    );
    var snaps = await getDocs(q);
    var items = snaps.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    items = items.filter(function (i) { return i.id !== p.id; }).slice(0, 3);
    if (!items.length) {
      grid.innerHTML = '<p class=\"text-muted\">No related products yet.</p>';
      return;
    }
    grid.innerHTML = items.map(function (i) {
      var img = (i.images && i.images[0]) || '/assets/images/placeholder.jpg';
      var pr = i.salePrice != null ? i.salePrice : i.price;
      return '<a class=\"related-card\" href=\"/product.html?id=' + i.id + '\">'
        + '<div class=\"related-card__img\"><img src=\"' + img + '\" alt=\"\" loading=\"lazy\"></div>'
        + '<div class=\"related-card__body\">'
        + '<p class=\"related-card__name\">' + escapeHtml(i.name) + '</p>'
        + '<p class=\"related-card__price\">' + formatAED(pr) + '</p>'
        + '</div></a>';
    }).join('');
  } catch (err) {
    console.error('loadRelated failed', err);
    grid.innerHTML = '';
  }
}

// ---------- Reviews ----------
async function loadReviews(productId) {
  var list = document.getElementById('reviewsList');
  if (!list) return;
  try {
    var q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      limit(10)
    );
    var snaps = await getDocs(q);
    var items = snaps.docs.map(function (d) { return d.data(); });
    if (!items.length) {
      list.innerHTML = '<p class=\"text-muted\">No reviews yet. Be the first.</p>';
      return;
    }
    var sum = items.reduce(function (a, r) { return a + (r.rating || 0); }, 0);
    var avg = sum / items.length;
    setText('avgRating', avg.toFixed(1));
    var avgStars = document.getElementById('avgStars');
    if (avgStars) avgStars.innerHTML = renderStars(avg);
    setText('reviewCount', items.length + ' reviews');

    list.innerHTML = items.map(function (r) {
      return '<div class=\"review-card\">'
        + '<div class=\"review-card__head\">'
        + '<span class=\"review-card__name\">' + escapeHtml(r.userName || 'Customer') + '</span>'
        + '<span class=\"review-card__date\">' + (r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : '') + '</span>'
        + '</div>'
        + '<div class=\"star-row\" style=\"margin-bottom:var(--space-2);\">' + renderStars(r.rating || 0) + '</div>'
        + '<p class=\"review-card__text\">' + escapeHtml(r.text || '') + '</p>'
        + '</div>';
    }).join('');
  } catch (err) {
    console.error('loadReviews failed', err);
    list.innerHTML = '<p class=\"text-muted\">Reviews unavailable.</p>';
  }
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', function () {
  initGalleryNav();
  loadProduct();
});
// ---------- Qty stepper ----------
function initQtyStepper() {
  var input = document.getElementById('qtyInput');
  var minus = document.getElementById('qtyMinus');
  var plus  = document.getElementById('qtyPlus');
  if (!input || !minus || !plus) return;

  function clamp(v) {
    v = parseInt(v, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 99) v = 99;
    return v;
  }
  function sync() { selectedQty = clamp(input.value); input.value = selectedQty; }

  minus.addEventListener('click', function () { input.value = clamp(input.value) - 1; sync(); });
  plus.addEventListener('click', function () { input.value = clamp(input.value) + 1; sync(); });
  input.addEventListener('change', sync);
  input.addEventListener('blur', sync);
}

// ---------- Add to cart ----------
function handleAddToCart(redirectToCheckout) {
  if (!currentProduct) return;
  if (currentProduct.inStock === false) {
    showToast('This product is out of stock', 'warning');
    return;
  }
  var item = {
    productId: currentProduct.id,
    name: currentProduct.name,
    slug: currentProduct.slug,
    price: currentProduct.price,
    salePrice: currentProduct.salePrice != null ? currentProduct.salePrice : null,
    quantity: selectedQty,
    image: (currentProduct.images && currentProduct.images[0]) || '',
    attributes: {
      color: selectedColor || null,
      material: selectedMaterial || null
    }
  };
  try {
    addToCart(item);
    showToast('Added to cart', 'success');
    if (redirectToCheckout) {
      window.location.href = '/checkout.html';
    }
  } catch (err) {
    console.error('addToCart failed', err);
    showToast('Could not add to cart', 'error');
  }
}

// ---------- Product enquiry (customQuotes) ----------
function initEnquiry() {
  var btn = document.getElementById('enquiryBtn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (!currentProduct) return;
    openEnquiryModal();
  });
}

function openEnquiryModal() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay is-active';
  overlay.id = 'enquiryOverlay';

  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:var(--z-modal);display:flex;align-items:center;justify-content:center;padding:var(--space-4);pointer-events:none;';
  modal.innerHTML = ''
    + '<div style=\"pointer-events:all;width:100%;max-width:480px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);\">'
    + '<h2 style=\"font-family:var(--font-display);font-size:var(--text-xl);color:var(--color-text);margin:0 0 var(--space-4);\">Product Enquiry</h2>'
    + '<p style=\"font-size:var(--text-sm);color:var(--color-text-mid);margin:0 0 var(--space-5);\">Send us a question about this product. We will get back within 24 hours.</p>'
    + '<div class=\"input-group\" style=\"margin-bottom:var(--space-4);\">'
    + '<label class=\"input-label\" for=\"enqName\">Your Name</label>'
    + '<input class=\"input\" id=\"enqName\" type=\"text\" required>'
    + '</div>'
    + '<div class=\"input-group\" style=\"margin-bottom:var(--space-4);\">'
    + '<label class=\"input-label\" for=\"enqEmail\">Email</label>'
    + '<input class=\"input\" id=\"enqEmail\" type=\"email\" required>'
    + '</div>'
    + '<div class=\"input-group\" style=\"margin-bottom:var(--space-4);\">'
    + '<label class=\"input-label\" for=\"enqPhone\">Phone</label>'
    + '<input class=\"input\" id=\"enqPhone\" type=\"tel\" required>'
    + '</div>'
    + '<div class=\"input-group\" style=\"margin-bottom:var(--space-5);\">'
    + '<label class=\"input-label\" for=\"enqMessage\">Message</label>'
    + '<textarea class=\"input\" id=\"enqMessage\" rows=\"3\" required></textarea>'
    + '</div>'
    + '<div style=\"display:flex;gap:var(--space-3);\">'
    + '<button type=\"button\" class=\"btn btn--ghost\" id=\"enqCancel\" style=\"flex:1;\">Cancel</button>'
    + '<button type=\"button\" class=\"btn btn--primary\" id=\"enqSend\" style=\"flex:1;\">Send Enquiry</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  function close() {
    overlay.remove();
    modal.remove();
  }

  document.getElementById('enqCancel').addEventListener('click', close);
  overlay.addEventListener('click', close);

  document.getElementById('enqSend').addEventListener('click', async function () {
    var name = document.getElementById('enqName').value.trim();
    var email = document.getElementById('enqEmail').value.trim();
    var phone = document.getElementById('enqPhone').value.trim();
    var msg = document.getElementById('enqMessage').value.trim();

    if (!name || !email || !phone || !msg) {
      showToast('Please fill all fields', 'warning');
      return;
    }

    try {
      var { addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await addDoc(collection(db, 'customQuotes'), {
        productId: currentProduct.id,
        productName: currentProduct.name,
        name: name,
        email: email,
        phone: phone,
        message: msg,
        type: 'product_enquiry',
        status: 'new',
        createdAt: serverTimestamp()
      });
      showToast('Enquiry sent. We will be in touch.', 'success');
      close();
    } catch (err) {
      console.error('enquiry failed', err);
      showToast('Could not send enquiry. Try again.', 'error');
    }
  });
}

// ---------- Wire everything on load ----------
document.addEventListener('DOMContentLoaded', function () {
  initQtyStepper();
  initEnquiry();

  var addBtn = document.getElementById('addToCartBtn');
  var buyBtn = document.getElementById('buyNowBtn');
  if (addBtn) addBtn.addEventListener('click', function () { handleAddToCart(false); });
  if (buyBtn) buyBtn.addEventListener('click', function () { handleAddToCart(true); });
});