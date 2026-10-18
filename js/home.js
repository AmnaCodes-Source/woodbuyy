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