// ============================================================
// CAROUSEL TEST - JS logic for 3 designs
// ============================================================

function initCarousel(id, mode) {
  var carousel = document.getElementById(id);
  if (!carousel) return;

  var slides;
  var dotsContainer = carousel.querySelector('.carousel__dots');
  var prevBtn = carousel.querySelector('.carousel__nav--prev');
  var nextBtn = carousel.querySelector('.carousel__nav--next');
  var current = 0;
  var autoPlayTimer = null;
  var progressBar = carousel.querySelector('.carousel__progress-bar');

  // Get slides
  if (mode === 'slide') {
    slides = carousel.querySelectorAll('.carousel__track .carousel__slide');
  } else {
    slides = carousel.querySelectorAll('.carousel__slides .carousel__slide');
  }

  if (!slides.length) return;

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function() { goTo(i); });
      dotsContainer.appendChild(dot);
    });
  }

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;

    if (mode === 'slide') {
      var track = carousel.querySelector('.carousel__track');
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
    } else {
      slides.forEach(function(s, i) {
        s.classList.toggle('carousel__slide--active', i === current);
      });
    }

    // Update dots
    if (dotsContainer) {
      var dots = dotsContainer.querySelectorAll('.carousel__dot');
      dots.forEach(function(d, i) {
        d.classList.toggle('is-active', i === current);
      });
    }

    // Reset autoplay (for slide mode)
    if (mode === 'slide') {
      resetAutoPlay();
    }
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Auto-play
  function startAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(function() {
      next();
    }, 5000);
  }

  function resetAutoPlay() {
    startAutoPlay();
    if (progressBar) {
      progressBar.style.width = '0%';
      var start = Date.now();
      var duration = 5000;
      function tick() {
        var elapsed = Date.now() - start;
        var percent = Math.min(100, (elapsed / duration) * 100);
        progressBar.style.width = percent + '%';
        if (percent < 100) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }

  startAutoPlay();
  if (mode === 'slide') resetAutoPlay();

  // Pause on hover
  carousel.addEventListener('mouseenter', function() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  });
  carousel.addEventListener('mouseleave', function() {
    startAutoPlay();
    if (mode === 'slide') resetAutoPlay();
  });

  // Keyboard
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
}

// Initialize all three
document.addEventListener('DOMContentLoaded', function() {
  initCarousel('carousel1', 'fade');
  initCarousel('carousel2', 'slide');
  initCarousel('carousel3', 'zoom');
});