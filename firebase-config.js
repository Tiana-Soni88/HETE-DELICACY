// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3Sgvo6l5IQp8hbn_cyNTDhBFbB_mXyKU",
  authDomain: "hete-dlicacy.firebaseapp.com",
  databaseURL: "https://hete-dlicacy-default-rtdb.firebaseio.com",
  projectId: "hete-dlicacy",
  storageBucket: "hete-dlicacy.firebasestorage.app",
  messagingSenderId: "325604882509",
  appId: "1:325604882509:web:e5e2f02572cc50a2bf8404",
  measurementId: "G-T78JV616ZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);   // ← pass `app` explicitly so db & auth share the same instance

export { app, analytics, db, auth };