// ============================================================
// PRODUCT CAROUSEL TEST
// Static dummy products + 3 carousel modes
// ============================================================

var DUMMY_PRODUCTS = [
  { id: 'p1', name: 'Oak Dining Table', category: 'Dining', price: 180000, salePrice: null, image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80' },
  { id: 'p2', name: 'Chesterfield Sofa', category: 'Sofas', price: 320000, salePrice: 280000, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80' },
  { id: 'p3', name: 'Accent Chair', category: 'Chairs', price: 95000, salePrice: null, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80' },
  { id: 'p4', name: 'Coffee Table', category: 'Tables', price: 65000, salePrice: 55000, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80' },
  { id: 'p5', name: 'Cloud Sofa', category: 'Sofas', price: 450000, salePrice: null, image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80' },
  { id: 'p6', name: 'Outdoor Set', category: 'Outdoor', price: 220000, salePrice: null, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' }
];

function formatAED(fils) {
  if (fils == null) return 'AED 0.00';
  var n = (fils / 100).toFixed(2);
  var parts = n.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'AED ' + parts.join('.');
}

function renderCard(p, isSale) {
  var price = p.salePrice != null ? p.salePrice : p.price;
  var original = p.salePrice != null ? '<span class="pcard__price-original">' + formatAED(p.price) + '</span>' : '';
  var badge = isSale ? '<span class="pcard__badge">Sale</span>' : '';
  return '<a href="/product.html?id=' + p.id + '" class="pcard">'
    + '<div class="pcard__img-wrap">'
    + '<img class="pcard__img" src="' + p.image + '" alt="' + p.name + '" loading="lazy">'
    + badge
    + '</div>'
    + '<div class="pcard__body">'
    + '<div class="pcard__category">' + p.category + '</div>'
    + '<h3 class="pcard__name">' + p.name + '</h3>'
    + '<div class="pcard__price">'
    + '<span class="pcard__price-current">' + formatAED(price) + '</span>'
    + original
    + '</div>'
    + '</div>'
    + '</a>';
}

// ---------- Classic & Peek (slider modes) ----------
function initSlider(root, mode) {
  var track = root.querySelector('.pcarousel__track');
  var prevBtn = root.querySelector('.pcarousel__nav--prev');
  var nextBtn = root.querySelector('.pcarousel__nav--next');
  if (!track) return;

  // Render cards
  track.innerHTML = DUMMY_PRODUCTS.map(function(p) {
    return renderCard(p, p.salePrice != null);
  }).join('');

  var cards = track.querySelectorAll('.pcard');
  var current = 0;

  function update() {
    if (mode === 'classic') {
      // 3 visible on desktop, 2 on tablet, 1 on mobile
      var perView = 3;
      if (window.innerWidth < 1024) perView = 2;
      if (window.innerWidth < 640) perView = 1;

      var cardWidth = cards[0].offsetWidth;
      var gap = parseInt(getComputedStyle(track).gap) || 0;
      var offset = -(current * (cardWidth + gap));

      track.style.transform = 'translateX(' + offset + 'px)';
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= cards.length - perView;
    } else {
      // Peek mode: one card center, mark active
      cards.forEach(function(c, i) {
        c.classList.toggle('is-active', i === current);
      });
    }
  }

  function next() {
    var perView = mode === 'classic' ? (window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3) : 1;
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

// ---------- Gallery ----------
function initGallery(root) {
  var grid = root.querySelector('.pcarousel__grid');
  if (!grid) return;

  grid.innerHTML = DUMMY_PRODUCTS.map(function(p) {
    return renderCard(p, p.salePrice != null);
  }).join('');
}

// ---------- Init all ----------
document.addEventListener('DOMContentLoaded', function() {
  initSlider(document.getElementById('pcarousel1'), 'classic');
  initSlider(document.getElementById('pcarousel2'), 'peek');
  initGallery(document.getElementById('pcarousel3'));
});