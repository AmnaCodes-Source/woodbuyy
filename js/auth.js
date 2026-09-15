// ============================================
// WOODBUYY — AUTHENTICATION LOGIC
// Login, Register, Forgot Password, Logout
// ============================================

// ---------- DOM ELEMENTS ----------
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');

// ---------- TAB SWITCHING ----------
if (authTabs.length) {
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target form
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            if (targetTab === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
            
            // Hide forgot form
            forgotForm.classList.remove('active');
            forgotForm.style.display = 'none';
        });
    });
}

// ---------- PASSWORD TOGGLE ----------
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

// ---------- FORGOT PASSWORD LINK ----------
const forgotLink = document.getElementById('forgotPasswordLink');
if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Hide login and register forms
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        
        // Show forgot form
        forgotForm.classList.add('active');
        forgotForm.style.display = 'block';
        
        // Hide tabs
        document.querySelector('.auth-tabs').style.display = 'none';
    });
}

// ---------- BACK TO LOGIN ----------
const backBtn = document.getElementById('backToLogin');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        forgotForm.classList.remove('active');
        forgotForm.style.display = 'none';
        
        loginForm.classList.add('active');
        document.querySelector('.auth-tabs').style.display = 'flex';
        
        // Reset tab state
        authTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
    });
}

// ---------- LOGIN ----------
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked;
        const loginBtn = document.getElementById('loginBtn');
        
        // Clear previous errors
        setFieldError('loginEmail', 'loginEmailError', '');
        setFieldError('loginPassword', 'loginPasswordError', '');
        
        // Validate
        let hasError = false;
        
        if (!email) {
            setFieldError('loginEmail', 'loginEmailError', 'Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            setFieldError('loginEmail', 'loginEmailError', 'Please enter a valid email');
            hasError = true;
        }
        
        if (!password) {
            setFieldError('loginPassword', 'loginPasswordError', 'Password is required');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Set loading state
        setButtonLoading(loginBtn, true, 'Signing In...');
        
        try {
            // Set persistence
            await auth.setPersistence(
                rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION
            );
            
            // Sign in
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            showToast('Welcome back!', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                redirectTo('account.html');
            }, 800);
            
        } catch (error) {
            console.error('Login error:', error);
            
            let message = 'Login failed. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with this email.';
                    setFieldError('loginEmail', 'loginEmailError', message);
                    break;
                case 'auth/wrong-password':
                    message = 'Incorrect password. Please try again.';
                    setFieldError('loginPassword', 'loginPasswordError', message);
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    setFieldError('loginEmail', 'loginEmailError', message);
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many attempts. Please wait and try again.';
                    break;
                default:
                    message = error.message;
            }
            
            showToast(message, 'error');
            
        } finally {
            setButtonLoading(loginBtn, false);
        }
    });
}

// ---------- REGISTER ----------
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('regFirstName').value.trim();
        const lastName = document.getElementById('regLastName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const registerBtn = document.getElementById('registerBtn');
        
        // Clear previous errors
        setFieldError('regFirstName', 'regFirstNameError', '');
        setFieldError('regLastName', 'regLastNameError', '');
        setFieldError('regEmail', 'regEmailError', '');
        setFieldError('regPhone', 'regPhoneError', '');
        setFieldError('regPassword', 'regPasswordError', '');
        
        // Validate
        let hasError = false;
        
        if (!firstName) {
            setFieldError('regFirstName', 'regFirstNameError', 'First name is required');
            hasError = true;
        }
        
        if (!lastName) {
            setFieldError('regLastName', 'regLastNameError', 'Last name is required');
            hasError = true;
        }
        
        if (!email) {
            setFieldError('regEmail', 'regEmailError', 'Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            setFieldError('regEmail', 'regEmailError', 'Please enter a valid email');
            hasError = true;
        }
        
        if (!phone) {
            setFieldError('regPhone', 'regPhoneError', 'Phone number is required');
            hasError = true;
        } else if (!validatePhone(phone)) {
            setFieldError('regPhone', 'regPhoneError', 'Please enter a valid phone number');
            hasError = true;
        }
        
        if (!password) {
            setFieldError('regPassword', 'regPasswordError', 'Password is required');
            hasError = true;
        } else if (password.length < 6) {
            setFieldError('regPassword', 'regPasswordError', 'Password must be at least 6 characters');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Set loading state
        setButtonLoading(registerBtn, true, 'Creating Account...');
        
        try {
            // Create user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });
            
            // Save user data to Firestore
            await db.collection('users').doc(user.uid).set({
                firstName,
                lastName,
                email,
                phone,
                role: 'customer',
                isGuest: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast('Account created successfully!', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                redirectTo('account.html');
            }, 800);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            let message = 'Registration failed. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'This email is already registered.';
                    setFieldError('regEmail', 'regEmailError', message);
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    setFieldError('regEmail', 'regEmailError', message);
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak.';
                    setFieldError('regPassword', 'regPasswordError', message);
                    break;
                default:
                    message = error.message;
            }
            
            showToast(message, 'error');
            
        } finally {
            setButtonLoading(registerBtn, false);
        }
    });
}

// ---------- FORGOT PASSWORD ----------
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value.trim();
        const forgotBtn = document.getElementById('forgotBtn');
        
        setFieldError('forgotEmail', 'forgotEmailError', '');
        
        if (!email || !validateEmail(email)) {
            setFieldError('forgotEmail', 'forgotEmailError', 'Please enter a valid email');
            return;
        }
        
        setButtonLoading(forgotBtn, true, 'Sending...');
        
        try {
            await auth.sendPasswordResetEmail(email);
            showToast('Password reset link sent to your email!', 'success');
            
            // Go back to login
            setTimeout(() => {
                forgotForm.classList.remove('active');
                forgotForm.style.display = 'none';
                loginForm.classList.add('active');
                document.querySelector('.auth-tabs').style.display = 'flex';
            }, 1500);
            
        } catch (error) {
            console.error('Forgot password error:', error);
            
            let message = 'Failed to send reset link.';
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
            }
            
            setFieldError('forgotEmail', 'forgotEmailError', message);
            showToast(message, 'error');
            
        } finally {
            setButtonLoading(forgotBtn, false);
        }
    });
}

// ---------- LOGOUT ----------
function logoutUser() {
    return auth.signOut()
        .then(() => {
            storage.remove('woodbuyy_cart');
            showToast('Logged out successfully', 'success');
            redirectTo('index.html');
        })
        .catch((error) => {
            console.error('Logout error:', error);
            showToast('Failed to logout', 'error');
        });
}

// ---------- AUTH STATE OBSERVER ----------
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User logged in:', user.uid);
    } else {
        console.log('No user logged in');
    }
});

console.log('Woodbuyy Auth logic loaded');
