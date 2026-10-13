// =============================================================================================
// WOODBUYY - Firebase Configuration (v8 Compat)
// Public keys only. Safe to expose in frontend.
//
// Usage in HTML:
//   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
//   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
//   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
//   <script src="/js/firebase-config.js"></script>
//
// Then use: firebase.firestore(), firebase.auth()
// Globals: db, auth (also available as window.db, window.auth)
// =============================================================================================

(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDm0QDQKQzgGq9e5aJ1gX4I1yFDAEqtIF0",
    authDomain: "woodbuyy-uae.firebaseapp.com",
    projectId: "woodbuyy-uae",
    storageBucket: "woodbuyy-uae.firebasestorage.app",
    messagingSenderId: "882936702595",
    appId: "1:882936702595:web:c9b8d7c6e9f4e1a08f1db6"
  };

  if (typeof firebase === 'undefined') {
    console.error('Firebase compat SDK not loaded. Add the compat scripts before this file.');
    return;
  }

  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.db = firebase.firestore();
  window.auth = firebase.auth();
})();
