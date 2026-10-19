// ============================================================
// PRODUCT PAGE - js/product.js (v8 compat style)
// Reads ?id= from URL, fetches product, renders all sections.
// Money in fils; divide by 100 at display only.
// ============================================================

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
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val == null ? '' : val;
}

function showToast(msg, type) {
  if (typeof window.showToast === 'function' && window.showToast !== showToast) {
    window.showToast(msg, type);
  } else {
    console.log('[' + type + '] ' + msg);
  }
}

var currentProduct = null;
var selectedColor = null;
var selectedMaterial = null;
var selectedQty = 1;
var galleryIndex = 0;
var galleryImages = [];

function loadProduct() {
  var id = getParam('id');
  if (!id) {
    showToast('No product specified', 'error');
    return;
  }
  db.collection('Products').doc(id).get()
    .then(function (snap) {
      if (!snap.exists) {
        showToast('Product not found', 'error');
        return;
      }
      currentProduct = Object.assign({ id: snap.id }, snap.data());
      renderProduct(currentProduct);
    })
    .catch(function (err) {
      console.error('loadProduct failed', err);
      showToast('Could not load product', 'error');
    });
}

function renderProduct(p) {
  document.title = p.name + ' - Woodbuyy';
  setText('breadcrumbName', p.name);
  
  // Check if product is already in cart and get its quantity
  try {
    var cart = JSON.parse(localStorage.getItem('wb_cart') || '[]');
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === p.id) {
        selectedQty = cart[i].quantity;
        var qtyInput = document.getElementById('qtyInput');
        if (qtyInput) qtyInput.value = selectedQty;
        break;
      }
    }
  } catch(e) {}
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

  var badge = document.getElementById('galleryBadge');
  if (badge && p.isFeatured) {
    badge.textContent = 'Featured';
    badge.classList.add('is-visible');
  }
}

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
  if (row.firstChild) row.firstChild.classList.add('is-active');
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
    if (typeof window.addToCart === 'function') {
      window.addToCart(item);
    } else {
      var cart = JSON.parse(localStorage.getItem('wb_cart') || '[]');
      var existing = cart.find(function (i) { return i.productId === item.productId; });
      if (existing) existing.quantity += item.quantity;
      else cart.push(item);
      localStorage.setItem('wb_cart', JSON.stringify(cart));
    }
    showToast('Added to cart', 'success');
    if (redirectToCheckout) window.location.href = '/checkout.html';
  } catch (err) {
    console.error('addToCart failed', err);
    showToast('Could not add to cart', 'error');
  }
}

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

  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:var(--z-modal);display:flex;align-items:center;justify-content:center;padding:var(--space-4);pointer-events:none;';
  modal.innerHTML = ''
    + '<div style="pointer-events:all;width:100%;max-width:480px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">'
    + '<h2 style="font-family:var(--font-display);font-size:var(--text-xl);color:var(--color-text);margin:0 0 var(--space-4);">Product Enquiry</h2>'
    + '<p style="font-size:var(--text-sm);color:var(--color-text-mid);margin:0 0 var(--space-5);">Send us a question. We reply within 24 hours.</p>'
    + '<div class="input-group" style="margin-bottom:var(--space-4);">'
    + '<label class="input-label" for="enqName">Your Name</label>'
    + '<input class="input" id="enqName" type="text">'
    + '</div>'
    + '<div class="input-group" style="margin-bottom:var(--space-4);">'
    + '<label class="input-label" for="enqEmail">Email</label>'
    + '<input class="input" id="enqEmail" type="email">'
    + '</div>'
    + '<div class="input-group" style="margin-bottom:var(--space-4);">'
    + '<label class="input-label" for="enqPhone">Phone</label>'
    + '<input class="input" id="enqPhone" type="tel">'
    + '</div>'
    + '<div class="input-group" style="margin-bottom:var(--space-5);">'
    + '<label class="input-label" for="enqMessage">Message</label>'
    + '<textarea class="input" id="enqMessage" rows="3"></textarea>'
    + '</div>'
    + '<div style="display:flex;gap:var(--space-3);">'
    + '<button type="button" class="btn btn--ghost" id="enqCancel" style="flex:1;">Cancel</button>'
    + '<button type="button" class="btn btn--primary" id="enqSend" style="flex:1;">Send Enquiry</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  function close() { overlay.remove(); modal.remove(); }

  document.getElementById('enqCancel').addEventListener('click', close);
  overlay.addEventListener('click', close);

  document.getElementById('enqSend').addEventListener('click', function () {
    var name = document.getElementById('enqName').value.trim();
    var email = document.getElementById('enqEmail').value.trim();
    var phone = document.getElementById('enqPhone').value.trim();
    var msg = document.getElementById('enqMessage').value.trim();

    if (!name || !email || !phone || !msg) {
      showToast('Please fill all fields', 'warning');
      return;
    }

    db.collection('customQuotes').add({
      productId: currentProduct.id,
      productName: currentProduct.name,
      name: name,
      email: email,
      phone: phone,
      message: msg,
      type: 'product_enquiry',
      status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function () {
      showToast('Enquiry sent. We will be in touch.', 'success');
      close();
    })
    .catch(function (err) {
      console.error('enquiry failed', err);
      showToast('Could not send enquiry. Try again.', 'error');
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initGalleryNav();
  initQtyStepper();
  initEnquiry();

  var addBtn = document.getElementById('addToCartBtn');
  var buyBtn = document.getElementById('buyNowBtn');
  if (addBtn) addBtn.addEventListener('click', function () { handleAddToCart(false); });
  if (buyBtn) buyBtn.addEventListener('click', function () { handleAddToCart(true); });

  loadProduct();
});