// ============================================================
// ADMIN - Attributes Management
// Global colours, materials, sizes stored in 'attributes' collection
// ============================================================

var currentType = null;
var currentEditId = null;

// ---------- Load all attributes ----------
function loadAttributes() {
  db.collection('attributes').get()
    .then(function (snap) {
      var items = snap.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
      renderTable('colors-tbody', items.filter(function (a) { return a.type === 'color'; }), 'color');
      renderTable('materials-tbody', items.filter(function (a) { return a.type === 'material'; }), 'material');
      renderTable('sizes-tbody', items.filter(function (a) { return a.type === 'size'; }), 'size');
    })
    .catch(function (err) {
      console.error('loadAttributes failed:', err);
      var msg = '<tr><td colspan="4" class="attr-empty">Failed to load. Check Firestore rules.</td></tr>';
      document.getElementById('colors-tbody').innerHTML = msg;
      document.getElementById('materials-tbody').innerHTML = '<tr><td colspan="2" class="attr-empty">Failed to load.</td></tr>';
      document.getElementById('sizes-tbody').innerHTML = '<tr><td colspan="2" class="attr-empty">Failed to load.</td></tr>';
    });
}

// ---------- Render table ----------
function renderTable(tbodyId, items, type) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (items.length === 0) {
    var cols = type === 'color' ? 4 : 2;
    tbody.innerHTML = '<tr><td colspan="' + cols + '" class="attr-empty">No ' + type + 's yet.</td></tr>';
    return;
  }

  if (type === 'color') {
    tbody.innerHTML = items.map(function (a) {
      return '<tr>'
        + '<td><span class="attr-swatch-preview" style="background:' + (a.hex || '#000') + ';"></span></td>'
        + '<td>' + escapeHtml(a.name) + '</td>'
        + '<td><code style="font-size:12px;color:var(--color-text-mid);">' + escapeHtml(a.hex || '-') + '</code></td>'
        + '<td><div class="attr-actions">'
        + '<button onclick="editAttribute(\'' + a.id + '\',\'' + type + '\',\'' + escapeHtml(a.name) + '\',\'' + (a.hex || '') + '\')" title="Edit"><i class="ri-edit-line"></i></button>'
        + '<button class="attr-delete" onclick="deleteAttribute(\'' + a.id + '\')" title="Delete"><i class="ri-delete-bin-line"></i></button>'
        + '</div></td>'
        + '</tr>';
    }).join('');
  } else {
    tbody.innerHTML = items.map(function (a) {
      return '<tr>'
        + '<td>' + escapeHtml(a.name) + '</td>'
        + '<td><div class="attr-actions">'
        + '<button onclick="editAttribute(\'' + a.id + '\',\'' + type + '\',\'' + escapeHtml(a.name) + '\',\'\')" title="Edit"><i class="ri-edit-line"></i></button>'
        + '<button class="attr-delete" onclick="deleteAttribute(\'' + a.id + '\')" title="Delete"><i class="ri-delete-bin-line"></i></button>'
        + '</div></td>'
        + '</tr>';
    }).join('');
  }
}

// ---------- Modal ----------
function openAttributeModal(type, editId) {
  currentType = type;
  currentEditId = editId || null;

  var modal = document.getElementById('attribute-modal');
  var title = document.getElementById('modal-title');
  var nameInput = document.getElementById('attr-name');
  var hexGroup = document.getElementById('attr-hex-group');
  var hexInput = document.getElementById('attr-hex');

  title.textContent = (editId ? 'Edit ' : 'Add ') + type.charAt(0).toUpperCase() + type.slice(1);
  nameInput.value = '';
  hexInput.value = '';

  if (type === 'color') {
    hexGroup.style.display = 'block';
  } else {
    hexGroup.style.display = 'none';
  }

  modal.style.display = 'flex';
  nameInput.focus();
}

function closeAttributeModal() {
  document.getElementById('attribute-modal').style.display = 'none';
  currentType = null;
  currentEditId = null;
}

function editAttribute(id, type, name, hex) {
  openAttributeModal(type, id);
  document.getElementById('attr-name').value = name;
  document.getElementById('attr-hex').value = hex;
}

// ---------- Save ----------
function saveAttribute() {
  var name = document.getElementById('attr-name').value.trim();
  var hex = document.getElementById('attr-hex').value.trim();

  if (!name) {
    showToast('Please enter a name', 'warning');
    return;
  }
  if (currentType === 'color' && !hex) {
    showToast('Please enter a hex colour', 'warning');
    return;
  }

  var data = {
    type: currentType,
    name: name,
    slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (currentType === 'color') {
    data.hex = hex;
  }

  var promise;
  if (currentEditId) {
    promise = db.collection('attributes').doc(currentEditId).update(data);
  } else {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    promise = db.collection('attributes').add(data);
  }

  promise.then(function () {
    showToast(currentEditId ? 'Updated' : 'Added', 'success');
    closeAttributeModal();
    loadAttributes();
  }).catch(function (err) {
    console.error('saveAttribute failed:', err);
    showToast('Failed to save. Check Firestore rules.', 'error');
  });
}

// ---------- Delete ----------
function deleteAttribute(id) {
  if (!confirm('Delete this attribute?')) return;

  db.collection('attributes').doc(id).delete()
    .then(function () {
      showToast('Deleted', 'success');
      loadAttributes();
    })
    .catch(function (err) {
      console.error('deleteAttribute failed:', err);
      showToast('Failed to delete. Check Firestore rules.', 'error');
    });
}

// ---------- Helpers ----------
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function showToast(msg, type) {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
  } else {
    console.log('[' + type + '] ' + msg);
  }
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', function () {
  var saveBtn = document.getElementById('attr-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveAttribute);

  var nameInput = document.getElementById('attr-name');
  if (nameInput) {
    nameInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') saveAttribute();
    });
  }

  loadAttributes();
});