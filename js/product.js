// ============================================================
// PRODUCT PAGE - FINAL VERSION
// Attributes, Slider, Tabs, Similar Items
// ============================================================

var currentProduct = null;
var selectedColor = null;
var selectedMaterial = null;
var selectedSize = null;
var selectedQty = 1;
var galleryImages = [];
var galleryIndex = 0;
var isAddingToCart = false;

// Helpers
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }
function formatAED(fils) {
  if (fils == null) return 'AED 0.00';
  var n = (fils / 100).toFixed(2);
  var parts = n.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'AED ' + parts.join('.');
}
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val == null ? '' : val;
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
function showToast(msg, type) {
  if (typeof window.showToast === 'function' && window.showToast !== showToast) {
    window.showToast(msg, type);
  } else {
    console.log('[' + type + '] ' + msg);
  }
}

// Load Product
function loadProduct() {
  var id = getParam('id');
  if (!id) { showToast('No product specified', 'error'); return; }

  db.collection('Products').doc(id).get().then(function(snap) {
    if (!snap.exists) { showToast('Product not found', 'error'); return; }
    
    currentProduct = Object.assign({ id: snap.id }, snap.data());
    
    // Fetch global attributes
    db.collection('attributes').get().then(function(attrSnap) {
      var globalAttributes = attrSnap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      renderProduct(currentProduct, globalAttributes);
    }).catch(function() {
      renderProduct(currentProduct, []);
    });

  }).catch(function(err) {
    console.error('Product load failed', err);
    showToast('Could not load product', 'error');
  });
}

// Render Product
function renderProduct(p, attributes) {
  document.title = p.name + ' - Woodbuyy';
  setText('breadcrumbName', p.name);
  setText('productCategory', (p.categorySlug || 'furniture').replace(/-/g, ' '));
  setText('productName', p.name);
  
  var price = p.salePrice != null ? p.salePrice : p.price;
  setText('productPrice', formatAED(price));

  if (p.salePrice != null && p.price > p.salePrice) {
    setText('productPriceOriginal', formatAED(p.price));
    setText('productSave', 'Save ' + formatAED(p.price - p.salePrice));
  }

  // Excerpt
  setText('productExcerpt', p.excerpt || p.description || '');

  // Gallery
  galleryImages = p.images || [];
  galleryIndex = 0;
  renderGallery();

  // Tabs Content
  var longDesc = document.getElementById('longDescription');
  if (longDesc) {
    longDesc.innerHTML = p.longDescription ? '<p>' + escapeHtml(p.longDescription).replace(/\n/g, '</p><p>') + '</p>' : '<p>' + escapeHtml(p.description || '') + '</p>';
  }

  var infoTable = document.getElementById('additionalInfo');
  if (infoTable) {
    var materialName = p.attributes && p.attributes.material ? p.attributes.material : '-';
    var dims = p.attributes && p.attributes.dimensions ? (p.attributes.dimensions.W + 'W x ' + p.attributes.dimensions.D + 'D x ' + p.attributes.dimensions.H + 'H cm') : '-';
    var weight = p.attributes && p.attributes.weight ? p.attributes.weight + ' kg' : '-';
    var assembly = p.attributes && p.attributes.assembly ? p.attributes.assembly : 'Pre-assembled';
    
    infoTable.innerHTML = 
      '<tr><td>Material</td><td>' + escapeHtml(materialName) + '</td></tr>' +
      '<tr><td>Dimensions</td><td>' + escapeHtml(dims) + '</td></tr>' +
      '<tr><td>Weight</td><td>' + escapeHtml(weight) + '</td></tr>' +
      '<tr><td>Assembly</td><td>' + escapeHtml(assembly) + '</td></tr>';
  }

  // Dynamic Attributes (Colors, Materials, Sizes)
  renderAttributes(p, attributes);

  // Similar Items
  loadSimilarItems(p);

  // Cart Quantity Sync
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
}

// Render Attributes
function renderAttributes(p, globalAttrs) {
  // Color
  var colorRow = document.getElementById('colorSwatches');
  var colorGroup = document.getElementById('colorGroup');
  var colors = globalAttrs.filter(function(a) { return a.type === 'color'; });
  
  if (colors.length === 0) {
    if (colorGroup) colorGroup.style.display = 'none';
  } else if (colorRow) {
    colorRow.innerHTML = colors.map(function(c) {
      return '<button type="button" class="swatch" style="background-color:' + (c.hex || '#333') + '" title="' + c.name + '" onclick="selectColor(this, \'' + c.name + '\')"></button>';
    }).join('');
  }

  // Material
  var matSelect = document.getElementById('materialSelect');
  var matGroup = document.getElementById('materialGroup');
  var materials = globalAttrs.filter(function(a) { return a.type === 'material'; });
  
  if (materials.length === 0) {
    if (matGroup) matGroup.style.display = 'none';
  } else if (matSelect) {
    matSelect.innerHTML = '<option value="">Select material</option>' + 
      materials.map(function(m) { return '<option value="' + m.name + '">' + m.name + '</option>'; }).join('');
    matSelect.addEventListener('change', function() { selectedMaterial = this.value; });
  }

  // Size
  var sizeSelect = document.getElementById('sizeSelect');
  var sizeGroup = document.getElementById('sizeGroup');
  var sizes = globalAttrs.filter(function(a) { return a.type === 'size'; });
  
  if (sizes.length === 0) {
    if (sizeGroup) sizeGroup.style.display = 'none';
  } else if (sizeSelect) {
    sizeSelect.innerHTML = '<option value="">Select size</option>' + 
      sizes.map(function(s) { return '<option value="' + s.name + '">' + s.name + '</option>'; }).join('');
    sizeSelect.addEventListener('change', function() { selectedSize = this.value; });
  }
}

function selectColor(btn, name) {
  document.querySelectorAll('#colorSwatches .swatch').forEach(function(s) { s.classList.remove('is-active'); });
  btn.classList.add('is-active');
  selectedColor = name;
}

// Gallery Slider
function renderGallery() {
  var main = document.getElementById('mainImage');
  var skeleton = document.getElementById('gallerySkeleton');
  var strip = document.getElementById('thumbStrip');
  var dots = document.getElementById('galleryDots');
  
  if (!main || !galleryImages.length) return;
  if (skeleton) skeleton.style.display = 'none';

  function updateImage() {
    main.src = galleryImages[galleryIndex];
    main.classList.add('is-loaded');
    if (dots) {
      dots.innerHTML = galleryImages.map(function(_, i) {
        return '<button class="product-gallery__dot ' + (i === galleryIndex ? 'is-active' : '') + '" onclick="goToImage(' + i + ')"></button>';
      }).join('');
    }
    if (strip) {
      strip.innerHTML = galleryImages.map(function(url, i) {
        return '<button class="product-thumb ' + (i === galleryIndex ? 'is-active' : '') + '" onclick="goToImage(' + i + ')"><img src="' + url + '" alt=""></button>';
      }).join('');
    }
  }

  updateImage();

  var prev = document.getElementById('galleryPrev');
  var next = document.getElementById('galleryNext');
  
  if (prev) prev.onclick = function() { goToImage(galleryIndex - 1); };
  if (next) next.onclick = function() { goToImage(galleryIndex + 1); };
}

window.goToImage = function(i) {
  if (!galleryImages.length) return;
  galleryIndex = (i + galleryImages.length) % galleryImages.length;
  var main = document.getElementById('mainImage');
  if (main) main.src = galleryImages[galleryIndex];
  
  document.querySelectorAll('.product-gallery__dot').forEach(function(d, idx) { d.classList.toggle('is-active', idx === galleryIndex); });
  document.querySelectorAll('.product-thumb').forEach(function(t, idx) { t.classList.toggle('is-active', idx === galleryIndex); });
};

// Similar Items
function loadSimilarItems(p) {
  var track = document.getElementById('similarTrack');
  if (!track || !p.categoryId) return;

  db.collection('Products').where('categoryId', '==', p.categoryId).limit(5).get().then(function(snap) {
    var items = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    items = items.filter(function(i) { return i.id !== p.id; });
    
    if (items.length === 0) {
      track.innerHTML = '<p style="color:var(--color-text-mid);">No similar items found.</p>';
      return;
    }

    track.innerHTML = items.map(function(i) {
      var img = (i.images && i.images[0]) || '';
      var pr = i.salePrice != null ? i.salePrice : i.price;
      return '<a href="/product.html?id=' + i.id + '" class="pcard">' +
        '<div class="pcard__img-wrap"><img class="pcard__img" src="' + img + '"></div>' +
        '<div class="pcard__body">' +
        '<h3 class="pcard__name">' + escapeHtml(i.name) + '</h3>' +
        '<div class="pcard__price">' + formatAED(pr) + '</div>' +
        '</div></a>';
    }).join('');
    
    initCarouselLogic();
  });
}

function initCarouselLogic() {
  var root = document.getElementById('similarCarousel');
  if (!root) return;
  var track = root.querySelector('.pcarousel__track');
  var cards = track.querySelectorAll('.pcard');
  var prev = root.querySelector('.pcarousel__nav--prev');
  var next = root.querySelector('.pcarousel__nav--next');
  var current = 0;

  function update() {
    var perView = 3;
    if (window.innerWidth < 1024) perView = 2;
    if (window.innerWidth < 640) perView = 1;
    
    if (!cards.length) return;
    var cw = cards[0].offsetWidth;
    var gap = parseInt(getComputedStyle(track).gap) || 0;
    
    track.style.transform = 'translateX(-' + (current * (cw + gap)) + 'px)';
    
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= cards.length - perView;
  }

  if (prev) prev.onclick = function() { if (current > 0) { current--; update(); } };
  if (next) next.onclick = function() { 
    var perView = window.innerWidth < 640 ? 1 : (window.innerWidth < 1024 ? 2 : 3);
    if (current < cards.length - perView) { current++; update(); } 
  };
  window.addEventListener('resize', update);
  update();
}

// Tabs Logic
document.querySelectorAll('.product-tabs__btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.product-tabs__btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.product-tabs__panel').forEach(function(p) { p.classList.remove('active'); });
    
    this.classList.add('active');
    document.getElementById('tab-' + this.getAttribute('data-tab')).classList.add('active');
  });
});

// Quantity Stepper
function initQtyStepper() {
  var input = document.getElementById('qtyInput');
  var minus = document.getElementById('qtyMinus');
  var plus = document.getElementById('qtyPlus');
  if (!input || !minus || !plus) return;

  function clamp(v) { v = parseInt(v, 10); if (isNaN(v) || v < 1) v = 1; if (v > 99) v = 99; return v; }
  function sync() { selectedQty = clamp(input.value); input.value = selectedQty; }

  minus.addEventListener('click', function() { input.value = clamp(input.value) - 1; sync(); });
  plus.addEventListener('click', function() { input.value = clamp(input.value) + 1; sync(); });
  input.addEventListener('change', sync);
}

// Add to Cart
function handleAddToCart(redirect) {
  if (isAddingToCart || !currentProduct) return;
  isAddingToCart = true;
  
  var item = {
    productId: currentProduct.id, name: currentProduct.name, slug: currentProduct.slug,
    price: currentProduct.price, salePrice: currentProduct.salePrice != null ? currentProduct.salePrice : null,
    quantity: selectedQty, image: (currentProduct.images && currentProduct.images[0]) || '',
    attributes: { color: selectedColor, material: selectedMaterial, size: selectedSize }
  };
  
  try {
    var cart = JSON.parse(localStorage.getItem('wb_cart') || '[]');
    var existing = cart.find(function(i) { return i.productId === item.productId; });
    if (existing) { existing.quantity += item.quantity; } else { cart.push(item); }
    localStorage.setItem('wb_cart', JSON.stringify(cart));
    
    var updated = JSON.parse(localStorage.getItem('wb_cart') || '[]');
    var upd = updated.find(function(i) { return i.productId === item.productId; });
    if (upd) {
      selectedQty = upd.quantity;
      var inp = document.getElementById('qtyInput');
      if (inp) inp.value = selectedQty;
    }
    
    showToast('Added to cart', 'success');
    if (typeof window.updateGlobalCartCount === 'function') window.updateGlobalCartCount();
    if (redirect) window.location.href = '/checkout.html';
  } catch (err) {
    console.error('addToCart failed', err);
    showToast('Error adding to cart', 'error');
  }
  setTimeout(function() { isAddingToCart = false; }, 500);
}

// Enquiry
function initEnquiry() {
  var btn = document.getElementById('enquiryBtn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    if (!currentProduct) return;
    db.collection('customQuotes').add({
      productId: currentProduct.id, productName: currentProduct.name,
      name: 'Product Enquiry', email: 'N/A', phone: 'N/A',
      message: 'User clicked enquiry on ' + currentProduct.name,
      type: 'product_enquiry', status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
      showToast('Enquiry sent', 'success');
    });
  });
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  initQtyStepper();
  initEnquiry();
  
  var addBtn = document.getElementById('addToCartBtn');
  var buyBtn = document.getElementById('buyNowBtn');
  if (addBtn) addBtn.addEventListener('click', function() { handleAddToCart(false); });
  if (buyBtn) buyBtn.addEventListener('click', function() { handleAddToCart(true); });

  loadProduct();
});