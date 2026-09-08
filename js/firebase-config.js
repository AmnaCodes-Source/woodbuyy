// ============================================================
// WOODBUYY — Firebase Configuration (Public Keys Only)
// Compat version — works with regular <script> tags
// ============================================================

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

// Global references
const db = firebase.firestore();
const auth = firebase.auth();
