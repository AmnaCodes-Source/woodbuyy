// ============================================
// WOODBUYY — FIREBASE CONFIGURATION
// Project: woodbuyy-uae (me-central1)
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDm0QDQKQzgGq9e5aJ1gX4I1yFDAEqtIF0",
  authDomain: "woodbuyy-uae.firebaseapp.com",
  projectId: "woodbuyy-uae",
  storageBucket: "woodbuyy-uae.firebasestorage.app",
  messagingSenderId: "882936702595",
  appId: "1:882936702595:web:c9b8d7c6e9f4e1a08f1db6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

console.log('Woodbuyy Firebase initialized');
