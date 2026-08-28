// ============================================================
// WOODBUYY — Firebase Configuration (Public Keys Only)
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyD-KRqfQmjt4b6MvQ8l29PS2G2ztWnCFfU",
  authDomain: "woodbuyy-5a601.firebaseapp.com",
  projectId: "woodbuyy-5a601",
  storageBucket: "woodbuyy-5a601.firebasestorage.app",
  messagingSenderId: "249402360176",
  appId: "1:249402360176:web:dbbf25da8ea2c8b7e18fb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
