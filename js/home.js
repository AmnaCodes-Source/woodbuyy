// ============================================================
// HOME PAGE - js/home.js
// Loads categories from Firestore, renders tiles.
// ============================================================

// Fallback categories (agar Firestore mein nahi hain)
var FALLBACK_CATEGORIES = [
  { name: 'Accent Chairs', slug: 'accent-chairs', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600' },
  { name: 'Coffee Tables', slug: 'coffee-tables', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600' },
  { name: 'Dining Tables', slug: 'dining-tables', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600' },
  { name: 'Cloud Sofas', slug: 'cloud-sofas', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { name: 'Sofas', slug: 'sofas', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600' },
  { name: 'Outdoor Furniture', slug: 'outdoor-furniture', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' }
];

function renderCategoryTile(cat) {
  var img = cat.image || 'https://via.placeholder.com/600x750/1C1C1C/C9A96E?text=' + encodeURIComponent(cat.name);
  return '<a href="/category.html?slug=' + cat.slug + '" class="category-tile">'
    + '<img class="category-tile__image" src="' + img + '" alt="' + escapeHtml(cat.name) + '" loading="lazy" decoding="async">'
    + '<div class="category-tile__overlay">'
    + '<h2 class="category-tile__title">' + escapeHtml(cat.name) + '</h2>'
    + '<span class="category-tile__btn">View Collection</span>'
    + '</div>'
    + '</a>';
}

function renderSkeletons() {
  var grid = document.getElementById('categoryGrid');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < 6; i++) {
    html += '<div class="category-tile skeleton-tile"></div>';
  }
  grid.innerHTML = html;
}

function loadCategories() {
  var grid = document.getElementById('categoryGrid');
  if (!grid) return;
  
  renderSkeletons();

  if (typeof db === 'undefined') {
    grid.innerHTML = FALLBACK_CATEGORIES.map(renderCategoryTile).join('');
    return;
  }

  db.collection('categories').where('isActive', '==', true).orderBy('order').get()
    .then(function (snap) {
      if (snap.empty) {
        grid.innerHTML = FALLBACK_CATEGORIES.map(renderCategoryTile).join('');
      } else {
        var cats = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        grid.innerHTML = cats.map(renderCategoryTile).join('');
      }
    })
    .catch(function (err) {
      console.warn('Categories load failed, using fallback:', err);
      grid.innerHTML = FALLBACK_CATEGORIES.map(renderCategoryTile).join('');
    });
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCategories);
} else {
  loadCategories();
}
// ============================================================
// FEATURED PRODUCTS CAROUSEL (Design 1 - Classic)
// ============================================================

function formatAED(fils) {
  if (fils == null) return 'AED 0.00';
  var n = (fils / 100).toFixed(2);
  var parts = n.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'AED ' + parts.join('.');
}

function renderProductCard(p) {
  var price = p.salePrice != null ? p.salePrice : p.price;
  var original = p.salePrice != null ? '<span class="pcard__price-original">' + formatAED(p.price) + '</span>' : '';
  var badge = p.salePrice != null ? '<span class="pcard__badge">Sale</span>' : (p.isFeatured ? '<span class="pcard__badge">Featured</span>' : '');
  var img = (p.images && p.images[0]) || 'https://via.placeholder.com/600x450/1C1C1C/C9A96E?text=No+Image';
  
  return '<a href="/product.html?id=' + p.id + '" class="pcard">'
    + '<div class="pcard__img-wrap">'
    + '<img class="pcard__img" src="' + img + '" alt="' + escapeHtml(p.name) + '" loading="lazy">'
    + badge
    + '</div>'
    + '<div class="pcard__body">'
    + '<div class="pcard__category">' + escapeHtml(p.categorySlug || 'Furniture') + '</div>'
    + '<h3 class="pcard__name">' + escapeHtml(p.name) + '</h3>'
    + '<div class="pcard__price">'
    + '<span class="pcard__price-current">' + formatAED(price) + '</span>'
    + original
    + '</div>'
    + '</div>'
    + '</a>';
}

function initCarousel(root) {
  if (!root) return;
  var track = root.querySelector('.pcarousel__track');
  var prevBtn = root.querySelector('.pcarousel__nav--prev');
  var nextBtn = root.querySelector('.pcarousel__nav--next');
  if (!track) return;

  var cards = track.querySelectorAll('.pcard');
  if (!cards.length) return;
  
  var current = 0;

  function update() {
    var perView = 3;
    if (window.innerWidth < 1024) perView = 2;
    if (window.innerWidth < 640) perView = 1;

    var cardWidth = cards[0].offsetWidth;
    var gap = parseInt(getComputedStyle(track).gap) || 0;
    var offset = -(current * (cardWidth + gap));

    track.style.transform = 'translateX(' + offset + 'px)';
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= cards.length - perView;
  }

  function next() {
    var perView = window.innerWidth < 640 ? 1 : (window.innerWidth < 1024 ? 2 : 3);
    if (current < cards.length - perView) current++;
    update();
  }

  function prev() {
    if (current > 0) current--;
    update();
  }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);
  window.addEventListener('resize', update);
  update();
}

function loadFeaturedProducts() {
  var track = document.getElementById('homeCarouselTrack');
  var root = document.getElementById('homeCarousel');
  if (!track || !root) return;

  // Skeleton loading
  track.innerHTML = '<div class="pcard" style="height:400px;"><div class="skeleton" style="width:100%;height:100%;"></div></div>'.repeat(3);

  if (typeof db === 'undefined') {
    track.innerHTML = '<p style="color:var(--color-text-mid);">Could not load products.</p>';
    return;
  }

  db.collection('Products').where('isActive', '==', true).limit(10).get()
    .then(function(snap) {
      if (snap.empty) {
        track.innerHTML = '<p style="color:var(--color-text-mid);padding:var(--space-8);">No products yet.</p>';
        return;
      }
      
      var items = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      
      // Filter featured, agar featured nahi hain toh sab dikha do
      var featured = items.filter(function(p) { return p.isFeatured === true; });
      var finalItems = featured.length > 0 ? featured : items;

      track.innerHTML = finalItems.map(renderProductCard).join('');
      initCarousel(root);
    })
    .catch(function(err) {
      console.error('Featured products failed:', err);
      track.innerHTML = '<p style="color:var(--color-text-mid);padding:var(--space-8);">Could not load featured products.</p>';
    });
}

// Chalao jab page load ho
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
} else {
  loadFeaturedProducts();
}