// ============================================
// WOODBUYY — UI HELPERS & UTILITIES
// Toast, Modal, Currency Formatter, etc.
// ============================================

// ---------- CURRENCY FORMATTER ----------
function formatCurrency(fils) {
    const aed = fils / 100;
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(aed);
}

// ---------- TOAST SYSTEM ----------
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ri-checkbox-circle-line';
    if (type === 'error') icon = 'ri-close-circle-line';
    if (type === 'warning') icon = 'ri-alert-line';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---------- MODAL SYSTEM ----------
function showModal({ title, content, actions = [], onClose = null }) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" aria-label="Close">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="modal-body">${content}</div>
            ${actions.length ? `
                <div class="modal-actions">
                    ${actions.map(action => `
                        <button class="btn ${action.class || 'btn-outline'}" data-action="${action.value || ''}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
        if (onClose) onClose();
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    modal.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = actions.find(a => a.value === btn.dataset.action);
            if (action && action.onClick) {
                action.onClick(closeModal);
            } else {
                closeModal();
            }
        });
    });
    
    return { closeModal };
}

// ---------- SET BUTTON LOADING ----------
function setButtonLoading(btn, isLoading, loadingText = '') {
    if (!btn) return;
    
    if (isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> ${loadingText || 'Loading...'}`;
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
        btn.disabled = false;
        delete btn.dataset.originalText;
    }
}

// ---------- FORM VALIDATION HELPERS ----------
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\+?[\d\s-]{9,15}$/;
    return re.test(phone);
}

function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if (!input || !error) return;
    
    if (message) {
        input.classList.add('error');
        error.textContent = message;
    } else {
        input.classList.remove('error');
        error.textContent = '';
    }
}

// ---------- DEBOUNCE ----------
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ---------- LOCAL STORAGE HELPERS ----------
const storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage full or unavailable');
        }
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    clear() {
        localStorage.clear();
    }
};

// ---------- REDIRECT ----------
function redirectTo(url) {
    window.location.href = url;
}

// ---------- CHECK AUTH STATE ----------
function checkAuth() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

// ---------- GET URL PARAM ----------
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

console.log('Woodbuyy UI helpers loaded');
