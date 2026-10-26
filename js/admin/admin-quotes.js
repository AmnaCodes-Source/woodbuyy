// ============================================================
// ADMIN - Custom Quotes Management
// ============================================================

function loadQuotes() {
  var tbody = document.getElementById('quotesTbody');
  var filter = document.getElementById('statusFilter');
  if (!tbody) return;

  var statusFilter = filter ? filter.value : '';

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;">Loading...</td></tr>';

  var query = db.collection('customQuotes').orderBy('createdAt', 'desc');
  
  if (statusFilter) {
    query = db.collection('customQuotes').where('status', '==', statusFilter).orderBy('createdAt', 'desc');
  }

  query.get()
    .then(function(snap) {
      if (snap.empty) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;">No quote requests yet.</td></tr>';
        return;
      }
      var html = '';
      snap.forEach(function(doc) {
        var q = doc.data();
        var date = q.createdAt ? q.createdAt.toDate().toLocaleDateString() : 'N/A';
        
        var statusColor = q.status === 'new' ? '#E5A443' : (q.status === 'contacted' ? '#5B9BD5' : '#4CAF7D');
        
        // Details block
        var details = '<strong>' + escapeHtml(q.furnitureType || q.type || 'Custom') + '</strong><br>';
        if (q.description) details += '<span style="font-size:12px;color:var(--color-text-muted);">' + escapeHtml(q.description).substring(0, 50) + '...</span>';

        html += '<tr>'
          + '<td>' + date + '</td>'
          + '<td>' + escapeHtml(q.name) + '</td>'
          + '<td><a href="tel:' + escapeHtml(q.phone) + '" style="color:var(--color-accent);">' + escapeHtml(q.phone) + '</a><br>'
          + '<a href="mailto:' + escapeHtml(q.email) + '" style="font-size:12px;color:var(--color-text-muted);">' + escapeHtml(q.email) + '</a></td>'
          + '<td style="max-width:300px;">' + details + '</td>'
          + '<td><span style="color:' + statusColor + ';text-transform:uppercase;font-size:11px;font-weight:600;">' + escapeHtml(q.status || 'new') + '</span></td>'
          + '<td>'
          + '<button class="btn btn--ghost btn--sm" onclick="viewQuote(\'' + doc.id + '\')" title="View"><i class="ri-eye-line"></i></button>'
          + '<button class="btn btn--ghost btn--sm" onclick="updateStatus(\'' + doc.id + '\', \'contacted\')" title="Mark as Contacted"><i class="ri-phone-line"></i></button>'
          + '</td>'
          + '</tr>';
      });
      tbody.innerHTML = html;
    })
    .catch(function(err) {
      console.error('Load quotes failed:', err);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#e05555;">Failed to load. Check Firestore rules.</td></tr>';
    });
}

function updateStatus(id, status) {
  if (!confirm('Update status to ' + status + '?')) return;
  db.collection('customQuotes').doc(id).update({ status: status })
    .then(function() {
      if (typeof window.showToast === 'function') window.showToast('Status updated', 'success');
      loadQuotes();
    })
    .catch(function(err) {
      console.error('Status update failed', err);
      if (typeof window.showToast === 'function') window.showToast('Failed to update', 'error');
    });
}

function viewQuote(id) {
  // Firestore se document fetch karo taake modal mein puri detail dikhe
  db.collection('customQuotes').doc(id).get().then(function(doc) {
    if (!doc.exists) return;
    var q = doc.data();
    var date = q.createdAt ? q.createdAt.toDate().toLocaleString() : 'N/A';

    var msg = '<div style="text-align:left;color:var(--color-text);line-height:1.6;font-size:14px;">'
      + '<p><strong>Name:</strong> ' + escapeHtml(q.name) + '</p>'
      + '<p><strong>Phone:</strong> ' + escapeHtml(q.phone) + '</p>'
      + '<p><strong>Email:</strong> ' + escapeHtml(q.email) + '</p>'
      + '<p><strong>Emirate:</strong> ' + escapeHtml(q.emirate || 'N/A') + '</p>'
      + '<p><strong>Type:</strong> ' + escapeHtml(q.furnitureType || q.type || 'Custom') + '</p>'
      + '<p><strong>Material:</strong> ' + escapeHtml(q.material || 'N/A') + '</p>'
      + '<p><strong>Size:</strong> ' + escapeHtml(q.size || 'N/A') + '</p>'
      + '<p><strong>Budget:</strong> ' + escapeHtml(q.budget || 'N/A') + '</p>'
      + '<p><strong>Description:</strong><br>' + escapeHtml(q.description || 'N/A') + '</p>'
      + '<p><strong>Date:</strong> ' + date + '</p>'
      + '</div>';

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Quote Details',
        html: msg,
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        confirmButtonColor: 'var(--color-accent)'
      });
    } else {
      alert('Name: ' + q.name + '\nPhone: ' + q.phone + '\nEmail: ' + q.email + '\nEmirate: ' + (q.emirate || 'N/A') + '\n\nType: ' + (q.furnitureType || q.type) + '\nMaterial: ' + (q.material || 'N/A') + '\nSize: ' + (q.size || 'N/A') + '\nBudget: ' + (q.budget || 'N/A') + '\n\nDescription:\n' + (q.description || 'N/A'));
    }
  });
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var filter = document.getElementById('statusFilter');
  if (filter) filter.addEventListener('change', loadQuotes);
  
  loadQuotes();
});