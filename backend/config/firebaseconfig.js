const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
const firebaseApp = initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ai-planner-booking-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

// Get Admin SDK instances
const adminDatabase = getDatabase(firebaseApp);
const adminAuth = getAuth(firebaseApp);

// Export Admin SDK instances with aliases that components expect
module.exports = { 
  firebaseApp, 
  adminDatabase, 
  adminAuth,
  // Export aliases that components expect
  auth: adminAuth,
  database: adminDatabase,
  // Export Firebase functions for components (using Admin SDK)
  ref: (path) => adminDatabase.ref(path),
  set: (ref, data) => ref.set(data),
  push: (ref, data) => ref.push(data),
  get: (ref) => ref.get(),
  remove: (ref) => ref.remove()
};