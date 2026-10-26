// ============================================================
// CUSTOM QUOTE PAGE - Form submit to Firestore
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('customQuoteForm');
  var submitBtn = document.getElementById('submitQuoteBtn');
  var successView = document.getElementById('quoteSuccess');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('qName').value.trim();
    var phone = document.getElementById('qPhone').value.trim();
    var email = document.getElementById('qEmail').value.trim();
    var emirate = document.getElementById('qEmirate').value;
    var type = document.getElementById('qType').value;
    var material = document.getElementById('qMaterial').value;
    var size = document.getElementById('qSize').value.trim();
    var budget = document.getElementById('qBudget').value;
    var description = document.getElementById('qDescription').value.trim();

    // Basic validation
    if (!name || !phone || !email || !emirate || !type || !description) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please fill all required fields', 'warning');
      }
      return;
    }

    // Disable button while saving
    submitBtn.classList.add('is-loading');
    submitBtn.innerHTML = '<span>Sending...</span>';

    var data = {
      name: name,
      phone: phone,
      email: email,
      emirate: emirate,
      furnitureType: type,
      material: material || null,
      size: size || null,
      budget: budget || null,
      description: description,
      source: 'custom-quote-page',
      status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('customQuotes').add(data)
      .then(function () {
        // Show success view
        form.style.display = 'none';
        successView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function (err) {
        console.error('Quote submit failed:', err);
        if (typeof window.showToast === 'function') {
          window.showToast('Could not submit. Please try again.', 'error');
        }
        submitBtn.classList.remove('is-loading');
        submitBtn.innerHTML = '<span>Submit Quote Request</span><i class="ri-arrow-right-line"></i>';
      });
  });
});