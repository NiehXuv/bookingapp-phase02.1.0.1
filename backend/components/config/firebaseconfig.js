const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
// import { getStorage } from 'firebase/storage';
const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

const firebaseApp = initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ai-planner-booking-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const firebaseConfig = {
  apiKey: "AIzaSyAmReB7z4l3s3GJYvxxrsQ61E3uQnwRK7M",
  authDomain: "ai-planner-booking.firebaseapp.com",
  databaseURL: "https://ai-planner-booking-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ai-planner-booking",
  storageBucket: "ai-planner-booking.firebasestorage.app",
  messagingSenderId: "1096530224966",
  appId: "1:1096530224966:web:21254b4b9bc3ebb31de747",
  measurementId: "G-FVHP2QZ8YZ"
};

const database = getDatabase(firebaseApp);
// const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp); 
module.exports = { firebaseApp, database, auth };