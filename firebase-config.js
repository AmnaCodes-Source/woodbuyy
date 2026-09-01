// ============================================
// WOODBUYY — FIREBASE CONFIGURATION
// Project: woodbuyy-5a601 (europe-west2)
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyD-KRqfQmjt4b6MvQ8l29PS2G2ztWnCFfU",
  authDomain: "woodbuyy-5a601.firebaseapp.com",
  projectId: "woodbuyy-5a601",
  storageBucket: "woodbuyy-5a601.firebasestorage.app",
  messagingSenderId: "249402360176",
  appId: "1:249402360176:web:dbbf25da8ea2c8b7e18fb5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Enable persistence for better offline experience
db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence requires multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Browser does not support persistence');
        }
    });

console.log('Woodbuyy Firebase initialized');
