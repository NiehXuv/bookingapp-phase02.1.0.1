const admin = require('firebase-admin');

// Load the service account key
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ai-planner-booking-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

// Get Admin SDK instances
const adminDatabase = admin.database(firebaseApp);
const adminAuth = admin.auth(firebaseApp);

// Export Admin SDK instances with aliases that components expect
module.exports = { 
  firebaseApp, 
  adminDatabase, 
  adminAuth,
  // Export aliases that components expect
  auth: adminAuth,
  database: adminDatabase,
  // Export Firebase functions for components (using Admin SDK directly)
  // Note: Chat components expect ref(database, path) pattern
  ref: (database, path) => database.ref(path),
  set: (path, data) => adminDatabase.ref(path).set(data),
  push: (path, data) => adminDatabase.ref(path).push(data),
  get: (path) => adminDatabase.ref(path).get(),
  remove: (path) => adminDatabase.ref(path).remove(),
  update: (path, data) => adminDatabase.ref(path).update(data)
};