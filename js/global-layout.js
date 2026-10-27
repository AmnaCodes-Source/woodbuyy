// ============================================================
// GLOBAL LAYOUT - Injects navbar + footer on every page
// ============================================================

(function() {

  var NAVBAR_HTML = ''
    + '<header class="global-navbar">'
    + '  <div class="global-navbar__top">'
    + '    <a href="/" class="global-navbar__logo">Woodbuyy</a>'
    + '    <div class="global-navbar__icons">'
    + '      <a href="/wishlist.html" class="global-navbar__icon" aria-label="Wishlist"><i class="ri-heart-line"></i></a>'
    + '      <a href="/cart.html" class="global-navbar__icon" aria-label="Cart"><i class="ri-shopping-bag-line"></i><span class="global-navbar__cart-count" id="globalCartCount"></span></a>'
    + '      <a href="/account.html" class="global-navbar__icon" aria-label="Account"><i class="ri-user-line"></i></a>'
    + '    </div>'
    + '  </div>'
    + '  <nav class="global-navbar__links">'
    + '    <a href="/">Home</a>'
    + '    <a href="/products.html">Shop Online</a>'
    + '    <a href="/category.html?slug=indoor">Indoor</a>'
    + '    <a href="/category.html?slug=outdoor">Outdoor</a>'
    + '    <a href="/products.html?sale=true">Sale</a>'
    + '    <a href="/contact.html">Contact</a>'
    + '    <a href="/about.html">About</a>'
    + '  </nav>'
    + '</header>';

  var FOOTER_HTML = ''
    + '<footer class="global-footer">'
    + '  <div class="global-footer__inner">'
    + '    <div class="global-footer__grid">'
    + '      <div>'
    + '        <a href="/" class="global-footer__logo">Woodbuyy</a>'
    + '        <p class="global-footer__desc">Woodbuyy is a trusted furniture provider in the UAE, offering premium sofas, beds, tables, and custom-made pieces. We deliver quality, durability, and design across the Emirates.</p>'
    + '        <div class="global-footer__social">'
    + '          <a href="#" aria-label="Facebook"><i class="ri-facebook-fill"></i></a>'
    + '          <a href="#" aria-label="Instagram"><i class="ri-instagram-line"></i></a>'
    + '          <a href="#" aria-label="LinkedIn"><i class="ri-linkedin-fill"></i></a>'
    + '          <a href="#" aria-label="WhatsApp"><i class="ri-whatsapp-line"></i></a>'
    + '        </div>'
    + '      </div>'
    + '      <div>'
    + '        <h4 class="global-footer__heading">Quick Links</h4>'
    + '        <ul class="global-footer__list">'
    + '          <li><a href="/">Home</a></li>'
    + '          <li><a href="/about.html">About Us</a></li>'
    + '          <li><a href="/products.html">Shop Online</a></li>'
    + '          <li><a href="/contact.html">Contact</a></li>'
    + '          <li><a href="/faq.html">FAQ</a></li>'
    + '        </ul>'
    + '      </div>'
    + '      <div>'
    + '        <h4 class="global-footer__heading">Contact Us</h4>'
    + '        <ul class="global-footer__list global-footer__list--contact">'
    + '          <li><i class="ri-map-pin-line"></i><span>Warehouse No - 13<br>Industrial Area 4, King Faisal Street<br>Sharjah, UAE</span></li>'
    + '          <li><i class="ri-phone-line"></i><a href="tel:+971501234567">+971 50 123 4567</a></li>'
    + '          <li><i class="ri-mail-line"></i><a href="mailto:info@woodbuyy.com">info@woodbuyy.com</a></li>'
    + '        </ul>'
    + '      </div>'
    + '      <div>'
    + '        <h4 class="global-footer__heading">Location</h4>'
    + '        <div class="global-footer__map">'
    + '          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.636735677552!2d55.38523831501569!3d25.29995898384795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5d1c3f3c3c3d%3A0x3c3c3c3c3c3c3c3c!2sAl%20Quoz%20Industrial%20Area%203%20-%20Dubai!5e0!3m2!1sen!2sae!4v1620000000000!5m2!1sen!2sae" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
    + '        </div>'
    + '      </div>'
    + '    </div>'
    + '    <div class="global-footer__bottom">'
    + '      <p>&copy; 2026 Woodbuyy Furniture Trading LLC. All rights reserved.</p>'
    + '      <div>'
    + '        <a href="/terms.html">Terms</a>'
    + '        <a href="/privacy.html">Privacy</a>'
    + '        <a href="/shipping.html">Shipping</a>'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '</footer>';

  function injectLayout() {
    var body = document.body;
    if (!body) return;

    // Navbar
    if (!document.querySelector('.global-navbar')) {
      var nav = document.createElement('div');
      nav.innerHTML = NAVBAR_HTML;
      body.insertBefore(nav.firstChild, body.firstChild);
    }

    // Footer
    if (!document.querySelector('.global-footer')) {
      var foot = document.createElement('div');
      foot.innerHTML = FOOTER_HTML;
      body.appendChild(foot.firstChild);
    }

    // Cart count
    try {
      var cart = JSON.parse(localStorage.getItem('wb_cart') || '[]');
      var count = 0;
      for (var i = 0; i < cart.length; i++) count += cart[i].quantity || 0;
      var badge = document.getElementById('globalCartCount');
      if (badge && count > 0) badge.textContent = count;
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLayout);
  } else {
    injectLayout();
  }


// ============================================================
// GLOBAL CART COUNT UPDATER
// ============================================================
window.updateGlobalCartCount = function() {
  try {
    var cart = JSON.parse(localStorage.getItem('wb_cart') || '[]');
    var count = 0;
    for (var i = 0; i < cart.length; i++) count += cart[i].quantity || 0;
    var badge = document.getElementById('globalCartCount');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch(e) {}
};

// Call on load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(window.updateGlobalCartCount, 100);
});

})();