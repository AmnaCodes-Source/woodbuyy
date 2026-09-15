// ============================================
// WOODBUYY — PROFILE SETTINGS LOGIC
// ============================================

let currentUser = null;

// ---------- INIT PROFILE PAGE ----------
async function initProfile() {
    try {
        const user = await checkAuth();
        
        if (!user) {
            redirectTo('login.html');
            return;
        }
        
        currentUser = user;
        
        await loadProfileData(user);
        setupForms();
        setupPasswordToggles();
        setupLogout();
        
    } catch (error) {
        console.error('Profile init error:', error);
        showToast('Failed to load profile', 'error');
    }
}

// ---------- LOAD PROFILE DATA ----------
async function loadProfileData(user) {
    try {
        // Set email
        const emailInput = document.getElementById('profileEmail');
        if (emailInput && user.email) {
            emailInput.value = user.email;
        }
        
        // Load from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            
            const firstNameInput = document.getElementById('profileFirstName');
            const lastNameInput = document.getElementById('profileLastName');
            const phoneInput = document.getElementById('profilePhone');
            
            if (firstNameInput) firstNameInput.value = data.firstName || '';
            if (lastNameInput) lastNameInput.value = data.lastName || '';
            if (phoneInput) phoneInput.value = data.phone || '';
        }
        
    } catch (error) {
        console.warn('Load profile error:', error.message);
    }
}

// ---------- SETUP FORMS ----------
function setupForms() {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }
}

// ---------- SETUP PASSWORD TOGGLES ----------
function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ri-eye-line');
                icon.classList.add('ri-eye-off-line');
            } else {
                input.type = 'password';
                icon.classList.remove('ri-eye-off-line');
                icon.classList.add('ri-eye-line');
            }
        });
    });
}

// ---------- HANDLE PROFILE SUBMIT ----------
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('profileFirstName').value.trim();
    const lastName = document.getElementById('profileLastName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const submitBtn = document.getElementById('profileSubmitBtn');
    
    // Clear errors
    setFieldError('profileFirstName', 'profileFirstNameError', '');
    setFieldError('profileLastName', 'profileLastNameError', '');
    setFieldError('profilePhone', 'profilePhoneError', '');
    
    // Validate
    let hasError = false;
    
    if (!firstName) {
        setFieldError('profileFirstName', 'profileFirstNameError', 'First name is required');
        hasError = true;
    }
    
    if (!lastName) {
        setFieldError('profileLastName', 'profileLastNameError', 'Last name is required');
        hasError = true;
    }
    
    if (!phone) {
        setFieldError('profilePhone', 'profilePhoneError', 'Phone is required');
        hasError = true;
    } else if (!validatePhone(phone)) {
        setFieldError('profilePhone', 'profilePhoneError', 'Invalid phone number');
        hasError = true;
    }
    
    if (hasError) return;
    
    setButtonLoading(submitBtn, true, 'Saving...');
    
    try {
        // Update Firestore
        await db.collection('users').doc(currentUser.uid).update({
            firstName,
            lastName,
            phone,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update display name
        await currentUser.updateProfile({
            displayName: `${firstName} ${lastName}`
        });
        
        showToast('Profile updated!', 'success');
        
    } catch (error) {
        console.error('Update profile error:', error);
        showToast('Failed to update profile', 'error');
        
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ---------- HANDLE PASSWORD SUBMIT ----------
async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const submitBtn = document.getElementById('passwordSubmitBtn');
    
    // Clear errors
    setFieldError('currentPassword', 'currentPasswordError', '');
    setFieldError('newPassword', 'newPasswordError', '');
    setFieldError('confirmNewPassword', 'confirmNewPasswordError', '');
    
    // Validate
    let hasError = false;
    
    if (!currentPassword) {
        setFieldError('currentPassword', 'currentPasswordError', 'Current password is required');
        hasError = true;
    }
    
    if (!newPassword) {
        setFieldError('newPassword', 'newPasswordError', 'New password is required');
        hasError = true;
    } else if (newPassword.length < 6) {
        setFieldError('newPassword', 'newPasswordError', 'Password must be at least 6 characters');
        hasError = true;
    }
    
    if (!confirmNewPassword) {
        setFieldError('confirmNewPassword', 'confirmNewPasswordError', 'Please confirm new password');
        hasError = true;
    } else if (newPassword !== confirmNewPassword) {
        setFieldError('confirmNewPassword', 'confirmNewPasswordError', 'Passwords do not match');
        hasError = true;
    }
    
    if (hasError) return;
    
    setButtonLoading(submitBtn, true, 'Updating...');
    
    try {
        // Re-authenticate
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        
        await currentUser.reauthenticateWithCredential(credential);
        
        // Update password
        await currentUser.updatePassword(newPassword);
        
        // Clear form
        document.getElementById('passwordForm').reset();
        
        showToast('Password updated!', 'success');
        
    } catch (error) {
        console.error('Update password error:', error);
        
        let message = 'Failed to update password';
        
        if (error.code === 'auth/wrong-password') {
            message = 'Current password is incorrect';
            setFieldError('currentPassword', 'currentPasswordError', message);
        } else if (error.code === 'auth/weak-password') {
            message = 'New password is too weak';
            setFieldError('newPassword', 'newPasswordError', message);
        }
        
        showToast(message, 'error');
        
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
document.addEventListener('DOMContentLoaded', initProfile);

console.log('Woodbuyy Profile logic loaded');
