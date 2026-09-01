// ============================================
// WOODBUYY — ADDRESSES PAGE LOGIC
// ============================================

let currentUserId = null;

// ---------- INIT ADDRESSES PAGE ----------
async function initAddresses() {
    try {
        const user = await checkAuth();
        
        if (!user) {
            redirectTo('login.html');
            return;
        }
        
        currentUserId = user.uid;
        
        await loadAddresses(user.uid);
        setupModal();
        setupLogout();
        
    } catch (error) {
        console.error('Addresses init error:', error);
        showToast('Failed to load addresses', 'error');
    }
}

// ---------- LOAD ADDRESSES ----------
async function loadAddresses(uid) {
    const container = document.getElementById('addressesGrid');
    
    if (!container) return;
    
    try {
        const addressesSnapshot = await db.collection('addresses')
            .where('userId', '==', uid)
            .get();
        
        if (addressesSnapshot.empty) {
            container.innerHTML = `
                <div class="addresses-empty">
                    <i class="ri-map-pin-line"></i>
                    <p>No saved addresses</p>
                    <button class="btn btn-primary btn-sm" onclick="openAddressModal()">
                        <i class="ri-add-line"></i> Add Address
                    </button>
                </div>
            `;
            return;
        }
        
        let addressesHTML = '';
        const addresses = [];
        
        addressesSnapshot.forEach(doc => {
            addresses.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        addresses.forEach(address => {
            addressesHTML += renderAddressCard(address);
        });
        
        container.innerHTML = `
            <div class="addresses-grid">
                ${addressesHTML}
            </div>
        `;
        
        setupAddressActions(container);
        
    } catch (error) {
        console.warn('Load addresses error:', error.message);
        container.innerHTML = `
            <div class="addresses-empty">
                <i class="ri-map-pin-line"></i>
                <p>No saved addresses</p>
                <button class="btn btn-primary btn-sm" onclick="openAddressModal()">
                    <i class="ri-add-line"></i> Add Address
                </button>
            </div>
        `;
    }
}

// ---------- RENDER ADDRESS CARD ----------
function renderAddressCard(address) {
    const isDefault = address.isDefault || false;
    
    return `
        <div class="address-card ${isDefault ? 'default' : ''}" data-id="${address.id}">
            ${isDefault ? '<span class="address-card-badge">Default</span>' : ''}
            <div class="address-card-name">${address.fullName || 'N/A'}</div>
            <div class="address-card-phone">
                <i class="ri-phone-line"></i> ${address.phone || 'N/A'}
            </div>
            <div class="address-card-detail">
                ${address.addressLine1 || ''}<br>
                ${address.city || ''}, ${address.emirate || ''}
            </div>
            <div class="address-card-actions">
                <button class="address-action-btn edit" data-action="edit">
                    <i class="ri-edit-line"></i> Edit
                </button>
                ${!isDefault ? `
                    <button class="address-action-btn" data-action="set-default">
                        <i class="ri-star-line"></i> Default
                    </button>
                ` : ''}
                <button class="address-action-btn delete" data-action="delete">
                    <i class="ri-delete-bin-line"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// ---------- SETUP ADDRESS ACTIONS ----------
function setupAddressActions(container) {
    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.address-card');
            const addressId = card.dataset.id;
            openAddressModal(addressId);
        });
    });
    
    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.address-card');
            const addressId = card.dataset.id;
            
            if (!addressId) return;
            
            const confirmed = confirm('Are you sure you want to delete this address?');
            
            if (!confirmed) return;
            
            try {
                await db.collection('addresses').doc(addressId).delete();
                showToast('Address deleted', 'success');
                loadAddresses(currentUserId);
                
            } catch (error) {
                console.error('Delete address error:', error);
                showToast('Failed to delete address', 'error');
            }
        });
    });
    
    container.querySelectorAll('[data-action="set-default"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.address-card');
            const addressId = card.dataset.id;
            
            if (!addressId) return;
            
            try {
                // Remove default from all addresses
                const addressesSnapshot = await db.collection('addresses')
                    .where('userId', '==', currentUserId)
                    .get();
                
                const batch = db.batch();
                
                addressesSnapshot.forEach(doc => {
                    if (doc.data().isDefault) {
                        batch.update(doc.ref, { isDefault: false });
                    }
                });
                
                batch.update(db.collection('addresses').doc(addressId), { isDefault: true });
                
                await batch.commit();
                
                showToast('Default address updated', 'success');
                loadAddresses(currentUserId);
                
            } catch (error) {
                console.error('Set default error:', error);
                showToast('Failed to update default', 'error');
            }
        });
    });
}

// ---------- SETUP MODAL ----------
function setupModal() {
    const modal = document.getElementById('addressModal');
    const closeBtn = document.getElementById('addressModalClose');
    const addBtn = document.getElementById('addAddressBtn');
    const form = document.getElementById('addressForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => openAddressModal());
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddressModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAddressModal();
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleAddressSubmit);
    }
}

// ---------- OPEN MODAL ----------
function openAddressModal(addressId = null) {
    const modal = document.getElementById('addressModal');
    const title = document.getElementById('addressModalTitle');
    const form = document.getElementById('addressForm');
    const hiddenId = document.getElementById('addressId');
    
    if (!modal) return;
    
    // Reset form
    form.reset();
    hiddenId.value = '';
    
    if (addressId) {
        title.textContent = 'Edit Address';
        
        // Load address data
        db.collection('addresses').doc(addressId).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('addressFullName').value = data.fullName || '';
                    document.getElementById('addressPhone').value = data.phone || '';
                    document.getElementById('addressLine1').value = data.addressLine1 || '';
                    document.getElementById('addressCity').value = data.city || '';
                    document.getElementById('addressEmirate').value = data.emirate || '';
                    document.getElementById('addressIsDefault').checked = data.isDefault || false;
                    hiddenId.value = addressId;
                }
            })
            .catch(err => console.warn('Load address error:', err));
            
    } else {
        title.textContent = 'Add Address';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ---------- CLOSE MODAL ----------
function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ---------- HANDLE ADDRESS SUBMIT ----------
async function handleAddressSubmit(e) {
    e.preventDefault();
    
    const addressId = document.getElementById('addressId').value;
    const fullName = document.getElementById('addressFullName').value.trim();
    const phone = document.getElementById('addressPhone').value.trim();
    const addressLine1 = document.getElementById('addressLine1').value.trim();
    const city = document.getElementById('addressCity').value.trim();
    const emirate = document.getElementById('addressEmirate').value;
    const isDefault = document.getElementById('addressIsDefault').checked;
    
    // Clear errors
    setFieldError('addressFullName', 'addressFullNameError', '');
    setFieldError('addressPhone', 'addressPhoneError', '');
    setFieldError('addressLine1', 'addressLine1Error', '');
    setFieldError('addressCity', 'addressCityError', '');
    setFieldError('addressEmirate', 'addressEmirateError', '');
    
    // Validate
    let hasError = false;
    
    if (!fullName) {
        setFieldError('addressFullName', 'addressFullNameError', 'Full name is required');
        hasError = true;
    }
    
    if (!phone) {
        setFieldError('addressPhone', 'addressPhoneError', 'Phone is required');
        hasError = true;
    } else if (!validatePhone(phone)) {
        setFieldError('addressPhone', 'addressPhoneError', 'Invalid phone number');
        hasError = true;
    }
    
    if (!addressLine1) {
        setFieldError('addressLine1', 'addressLine1Error', 'Address is required');
        hasError = true;
    }
    
    if (!city) {
        setFieldError('addressCity', 'addressCityError', 'City is required');
        hasError = true;
    }
    
    if (!emirate) {
        setFieldError('addressEmirate', 'addressEmirateError', 'Emirate is required');
        hasError = true;
    }
    
    if (hasError) return;
    
    const submitBtn = document.getElementById('addressSubmitBtn');
    setButtonLoading(submitBtn, true, 'Saving...');
    
    try {
        const addressData = {
            userId: currentUserId,
            fullName,
            phone,
            addressLine1,
            city,
            emirate,
            isDefault,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (addressId) {
            // Update existing
            await db.collection('addresses').doc(addressId).update(addressData);
            showToast('Address updated!', 'success');
        } else {
            // Add new
            addressData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            // If set as default, remove default from others
            if (isDefault) {
                const addressesSnapshot = await db.collection('addresses')
                    .where('userId', '==', currentUserId)
                    .get();
                
                const batch = db.batch();
                addressesSnapshot.forEach(doc => {
                    if (doc.data().isDefault) {
                        batch.update(doc.ref, { isDefault: false });
                    }
                });
                await batch.commit();
            }
            
            await db.collection('addresses').add(addressData);
            showToast('Address added!', 'success');
        }
        
        closeAddressModal();
        loadAddresses(currentUserId);
        
    } catch (error) {
        console.error('Save address error:', error);
        showToast('Failed to save address', 'error');
        
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ---------- SETUP LOGOUT ----------
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
}

// ---------- INIT ON DOM READY ----------
document.addEventListener('DOMContentLoaded', initAddresses);

console.log('Woodbuyy Addresses logic loaded');
